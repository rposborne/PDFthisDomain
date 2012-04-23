require 'sinatra'
require 'haml'
require 'uri'
require 'metainspector'
#require 'anemone'
require 'resque'
require 'timeout'
require 'json'
require 'data_mapper'
require 'dm-sqlite-adapter'
require './worker'
require './models/order'
DataMapper.setup(:default, ENV['DATABASE_URL'] || 'sqlite3::memory:')
DataMapper.auto_upgrade!
enable :sessions
configure :production do
  require 'newrelic_rpm'
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
  @limit = 2
  @processed_urls = []
  page = MetaInspector.new(params["url"])
  @processed_urls = page.absolute_links.map { |link| link  unless ( URI.parse(link).host != URI.parse(params["url"]).host ) rescue nil }.flatten.compact.uniq
  haml :prepare, :format => :html5, :layout => :application

end

post '/process' do 
  if session[:current_order]
    @order = Order.get(session[:current_order])
    @order.email = params["email"]
    @order.status = "Sent to Queue"
    @order.save
    @job = Resque.enqueue(Pdfs, {:email => @order.email, :url => @order.urls.first, :urls_to_process => @order.urls, :options =>  params["options"] })   
  else
    @order = Order.create(:email => params["email"], :urls => params["urls"].map {|i, l| l},:status => "Sent to Queue (Free)", :raw => params ,:created_at => Time.now,:updated_at => Time.now)
    @job = Resque.enqueue(Pdfs, {:email => @order.email, :url => @order.urls.first, :urls_to_process => @order.urls, :options =>  params["options"] })   
  end 
  haml :success, :format => :html5, :layout => :application
end

get '/process' do 
  @paypal = true
  @order = Order.get(session[:current_order])
  haml :success, :format => :html5, :layout => :application
end

post '/store' do
  @order = Order.create(:urls => params["urls"].map {|i, l| l},:status => "Sent To Processing", :raw => params ,:created_at => Time.now,:updated_at => Time.now)
  session[:current_order] = @order.id
  content_type :json
  @order.to_json
end
get '/admin/orders' do 
  @order = Order.all
  content_type :json
  @order.to_json
end

