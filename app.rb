require 'rubygems'
require 'sinatra'
require 'rpm_contrib'
require 'newrelic_rpm'
require 'rack-flash'
require 'haml'
require 'uri'
require 'metainspector'
#require 'anemone'
require 'resque'
require 'timeout'
require 'json'
require 'data_mapper'
require './worker'
require './models/order'

DataMapper.setup(:default, ENV['DATABASE_URL'] || 'sqlite3::memory:')
DataMapper.auto_upgrade!
enable :sessions
use Rack::Flash

helpers do

  def protected!
    unless authorized?
      response['WWW-Authenticate'] = %(Basic realm="Restricted Area")
      throw(:halt, [401, "Not authorized\n"])
    end
  end

  def authorized?
    @auth ||=  Rack::Auth::Basic::Request.new(request.env)
    @auth.provided? && @auth.basic? && @auth.credentials && @auth.credentials == ['admin', 'admin']
  end

end

#Prep Resque with the REDIS connection string
uri = URI.parse(ENV["REDISTOGO_URL"])
Resque.redis = Redis.new(:host => uri.host, :port => uri.port, :password => uri.password)

get '/' do
  
  haml :index, :format => :html5, :layout => :application
end

# Handle a Post to the root URL
# Pass back an array of spidered Links
post '/prepare' do
  @limit = 19
  begin
    page = Timeout::timeout(2) {
       MetaInspector.new(params["url"]).absolute_links
    } 
    @processed_urls = page.map { |link| link  unless ( URI.parse(link).host != URI.parse(params["url"]).host ) rescue nil }.flatten.compact.uniq 
    haml :prepare, :format => :html5, :layout => :application
  rescue Timeout::Error
    @status = true
    haml :index, :format => :html5, :layout => :application
  end
end

post '/process' do 
  if session[:current_order] && @order = Order.get(session[:current_order])
    
    @order.email = params["email"]
    @order.status = "Sent to Queue (Purchased)"
    @order.save
    @job = Resque.enqueue(Pdfs, {:id => @order.id, :email => @order.email, :url => @order.urls.first, :urls_to_process => @order.urls, :options =>  @order.options })   
  else
    @order = Order.create(:email => params["email"], :urls => params["urls"].map {|i, l| l},:status => "Sent to Queue (Free)", :raw => params ,:created_at => Time.now,:updated_at => Time.now, :options => params["options"])
    @job = Resque.enqueue(Pdfs, {:id => @order.id, :email => @order.email, :url => @order.urls.first, :urls_to_process => @order.urls, :options =>  @order.options })   
  end 
  session[:current_order] = 0
  haml :success, :format => :html5, :layout => :application
end

get '/process' do 
  @paypal = true
  @order = Order.get(session[:current_order])
  haml :success, :format => :html5, :layout => :application
end

post '/store' do
  @order = Order.create(:urls => params["urls"].map {|i, l| l},:status => "Sent To Payment", :raw => params ,:created_at => Time.now,:updated_at => Time.now, :options =>  params["options"])
  session[:current_order] = @order.id
  content_type :json
  @order.to_json
end

get '/preview' do
  session[:preview_count] ||= 0
  if session[:preview_count] < 2
     # session[:preview_count] += 1
      content_type "image/jpeg"
      render_url_to_image(params[:url])
  else
    "Preview Limit Reached"
  end
end

get '/admin/orders' do 
  protected!
  @orders = Order.all
  haml :orders, :format => :html5, :layout => :application
end

post '/worker_endpoint' do
  @order = Order.get(params["id"])
  if @order
    @order.attributes = params["order"]
    @order.save 
  end
    content_type :json
  @order.to_json
end
