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
    sudo "launchctl start com.recjs"
  end

  task :status do
    sudo "launchctl list com.recjs"
  end

  task :stop do
    sudo 'launchctl list com.recjs > /dev/null 2>&1; if [ $? -eq 0 ];then sudo launchctl stop com.recjs;fi'
  end

  desc "Restart RecJS service"
  task :restart do
    # check if the process is running, if so, restart
    sudo 'launchctl list com.recjs > /dev/null 2>&1; if [ $? -eq 0 ];then sudo launchctl stop com.recjs;fi'
    sudo "launchctl start com.recjs"
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
  end

end
