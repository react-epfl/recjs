require 'mongrel_cluster/recipes'
set :mongrel_conf, "#{current_path}/config/mongrel_cluster.yml"

set :rails_env, "devtest"
# =============================================================================
# ROLES
# =============================================================================
# You can define any number of roles, each of which contains any number of
# machines. Roles might include such things as :web, or :app, or :db, defining
# what the purpose of each machine is. You can also specify options that can
# be used to single out a specific subset of boxes in a particular role, like
# :primary => true.
#
role :web, "128.178.24.12"
role :app, "128.178.24.12"
role :db,  "128.178.24.12", :primary => true

namespace :deploy do

  task :start do
    #run "nohup /etc/init.d/xsportaxy start > tmp/nohup.out; cat tmp/nohup.out"
    run "sudo launchctl load -w /Library/LaunchDaemons/com.recjs.plist"
  end

  task :status do
    run "sudo launchctl list com.recjs"
  end

  task :stop do
    run "sudo launchctl unload -w /Library/LaunchDaemons/com.recjs.plist"
  end

  desc "Restart RecJS service"
  task :restart do
    #run "sudo launchctl stop"
    # start happens automatically by launchctl
  end

  desc "Populates apps and bundles from widget store"
  task :populate do
    run "curl http://localhost:9000/external/populate_apps"
    run "curl http://localhost:9000/external/populate_bundles"
  end


  # task :update_code, :roles => [:app, :db, :web] do
  #   on_rollback { run "rm -rf #{release_path}" }
  #
  #   set :svn_checkout, "svn checkout -q --username #{scm_username} --password #{scm_password} --no-auth-cache
  #     -r#{revision} #{repository} #{release_path} "
  #
  #
  #   # trying to fetch data from the svn server, if it didn't work out first time
  #   run "#{svn_checkout}; while [ $? -eq 1 ]; do #{svn_checkout}; done"
  #
  #   # puts revision number into release
  #   run "svn info --username #{scm_username} --password #{scm_password} --no-auth-cache #{repository}
  #      | grep Revision | sed 's/Revision: //' > #{release_path}/REVISION"
  #
  # end
  #
  # task :symlink, :roles => [:app, :db, :web] do
  #   # on_rollback { run "rm #{current_path}; ln -s #{previous_release} #{current_path}" }
  #   #
  #   # system("echo #{current_path}")
  #   # system("echo #{release_path}")
  #   # system("echo #{previous_release}")
  #   #
  #   # run "rm #{current_path}; ln -s #{release_path} #{current_path}"
  # end

  # Update database.yml and backgroundrb.yml
  task :after_update_code, :roles => :app do
    # run "chmod 755 #{current_path}/script/spin"

    #db_config_json = "#{sportaxy}/shared/config/database.json.production"
    #run "cp #{db_config_json} #{release_path}/config/database.json"

    # to use images in stylesheets in cache
    #run "ln -fs /#{release_path}/public/stylesheets/images #{release_path}/public/stylesheets/cache/images"
    #run "ln -fs /#{deploy_to}/shared/log #{release_path}/log"

    # manage saved event_files
    #run "mkdir #{release_path}/private"
    #run "ln -fs #{sportaxy}/shared/files/event_data #{release_path}/private/event_data"

    #run "rm -rf #{release_path}/public/user"
    #run "ln -fs #{sportaxy}/shared/system/user #{release_path}/public/user"

    # copy language files
    #run "rm -rf #{release_path}/config/locales"
    #run "ln -fs #{sportaxy}/current/config/locales #{release_path}/config/locales"

    # create tmp folder TODO:(seems as it is already created or exists)
    #run "mkdir #{release_path}/tmp"

    # generate language files {en,ru,..}.yml, {en,ru,..}.js
    #run "cd #{release_path}; script/translation/ondeploy production"
  end

end
