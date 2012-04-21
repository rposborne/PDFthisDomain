require 'sinatra'
require 'haml'
require 'uri'
require 'anemone'
require 'resque'

ENV['APP_ROOT'] ||= File.dirname(__FILE__)

configure :production do
  require 'newrelic_rpm'
end

#Prep Resque with the REDIS connection string
uri = URI.parse(ENV["REDISTOGO_URL"])
Resque.redis = Redis.new(:host => uri.host, :port => uri.port, :password => uri.password)

get '/' do
  haml :index, :format => :html5
end
# Handle a Post to the root URL
# Pass back an array of spidered Links
post '/' do
  url = params["url"]
  confirm = params["confirm"]
  @processed_urls = []
  Anemone.crawl(url, :depth_limit => 1, :obey_robots => true) do |anemone|
    anemone.on_every_page do |page|
      @processed_urls << page.url.to_s

    end
  end
  haml :index, :format => :html5
end

post '/process' do
  url = params["url"]
  email = params["email"]
  confirm = params["confirm"]
  @processed_urls = params["urls"].map {|i, l| l} 
  if email 
    @job = Resque.enqueue(Pdfs, {:email => email, :url => url, :urls_to_process => @processed_urls})
  end

  haml :index, :format => :html5

end


