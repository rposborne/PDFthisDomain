rails_env     = ENV['RAILS_ENV']  || "production"
rails_root    = ENV['RAILS_ROOT'] || "/app"
s3_secret     = ENV['S3_SECRET']
s3_key        = ENV['S3_KEY']
redistogo_url = ENV['REDISTOGO_URL']

num_workers = rails_env == 'production' ? 3 : 2

num_workers.times do |num|
  God.watch do |w|
    w.dir      = "#{rails_root}"
    w.name     = "resque-#{num}"
    w.group    = 'resque'
    w.interval = 30.seconds
    w.env      = {"QUEUE"=>"critical,high,low", "RAILS_ENV"=>rails_env , "S3_KEY" => s3_key , "S3_SECRET" => s3_secret, "REDISTOGO_URL" => redistogo_url}
    w.start    = "bundle exec rake -f #{rails_root}/Rakefile environment resque:work"

    w.uid = 'root'
    w.gid = 'root'

    # restart if memory gets too high
    w.transition(:up, :restart) do |on|
      on.condition(:memory_usage) do |c|
        c.above = 100.megabytes
        c.times = 2
      end
    end

    # determine the state on startup
    w.transition(:init, { true => :up, false => :start }) do |on|
      on.condition(:process_running) do |c|
        c.running = true
      end
    end

    # determine when process has finished starting
    w.transition([:start, :restart], :up) do |on|
      on.condition(:process_running) do |c|
        c.running = true
        c.interval = 5.seconds
      end

      # failsafe
      on.condition(:tries) do |c|
        c.times = 5
        c.transition = :start
        c.interval = 5.seconds
      end
    end

    # start if process is not running
    w.transition(:up, :start) do |on|
      on.condition(:process_running) do |c|
        c.running = false
      end
    end
  end
end