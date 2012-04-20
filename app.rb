require 'sinatra'
require 'haml'
require 'metainspector'
require 'shellwords'
require 'uri'
require 'zip/zip'
require 'anemone'
require 'resque'
require 'pony'
require 'fog'
ENV['APP_ROOT'] ||= File.dirname(__FILE__)


configure :production do
  require 'newrelic_rpm'
end

#Prep Resque with the REDIS connection string
uri = URI.parse(ENV["REDIS_TO_GO"])
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
    #@job = Resque.enqueue(Pdfs, {:email => email, :url => url, :urls_to_process => @processed_urls})
  end

  haml :index, :format => :html5

end

=begin
Worker Code

All PDF rendering and file generation happens in Memory. (Money Saving)

=end
class Pdfs
  @queue = :Pdfs
  def self.perform(job)
    email          = job["email"]
    url            = job["url"]
    processed_urls = job["urls_to_process"]
    name           = "#{email}_#{Time.now}.zip"
    t = Tempfile.new(name)
    temp_files = []
    processed_urls.uniq.take(10).each_with_index do |link, i|
      puts "Rendering Link #{link}"
      temp_files << {:file => render_url_to_pdf(link) ,:name => URI(link.dup).path.gsub!('/','_').to_s }
    end
    Zip::ZipOutputStream.open(t.path) do |z|
      temp_files.each do |file|
        title = file[:name]
        title += ".pdf" unless title.end_with?(".pdf")
        z.put_next_entry(title)
        z.print file[:file].read
      end
    end

    storage = Fog::Storage.new(
      :provider                 => 'AWS',
      :aws_secret_access_key    => ENV["S3_KEY"],
      :aws_access_key_id        => ENV["S3_SECRET"]  
    )
    directory = storage.directories.get("pdfthisurl")
    object = directory.files.create(
    :key    => name,
    :body   => t.read,
    :public => true
    )
    puts "Upload to S3 #{object.public_url} with attachment size of #{t.size}"
    puts "sending mail with attachment size of #{object.public_url}"
    Pony.mail :to => email,
    :from => 'pdfthisdomain@burningpony.com',
    :subject => 'The PDFs you requested!', 
    :headers => { 'Content-Type' => 'text/html' },
    :body => "<h1>Howdy!</h1> <br /> Your PDF can be found <a href =\"#{object.public_url}\"> Here</a>.<br \> <strong>They will only be avaliable for the next 24 hours.</strong><br \> <br \> Thanks, <br \> Russell"

  end
end

def render_url_to_pdf(url)
  t = Tempfile.new("#{Time.now}")
  puts "Rendering Link #{url}  to #{t.path}"
  wk = File.join(ENV['APP_ROOT'], "bin", "wkhtmltopdf-amd64")
  system("#{wk} #{url} #{Shellwords.escape(t.path)}")
  return t
end
