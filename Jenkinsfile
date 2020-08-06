@Library(value='kids-first/aws-infra-jenkins-shared-libraries', changelog=false) _
ecs_service_type_1_standard {
    projectName             = "kf-api-portal-reports"
    orgFullName             = "kids-first"
    account                 = "kf-strides"
    environments            = "dev,qa,prd"
    docker_image_type       = "alpine"
    create_default_iam_role = "1"
    entrypoint_command      = "/home/smile/smilecdr/bin/smilecdr run"
    quick_deploy            = "true"
    container_port          = "8000"
    health_check_path       = "/endpoint-health"
    external_config_repo    = "false"
    dependencies            = "ecr"
    deploy_scripts_version  = "master"
}