<?php

require '/var/www/html/vendor/autoload.php';
$app = require_once '/var/www/html/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Project;
use App\Models\Environment;
use App\Models\Application;
use App\Models\StandaloneDocker;
use App\Models\GithubApp;
use App\Models\EnvironmentVariable;

// 1. Create or Find Project 'loayltycardjam'
$projectName = 'loayltycardjam';
$project = Project::where('name', $projectName)->orWhere('name', 'loyaltycardjam')->first();
if (!$project) {
    $project = Project::create([
        'name' => $projectName,
        'description' => 'Sistem Kad Kesetiaan Jualan Agro MADANI (JAM Loyalty Card)',
        'team_id' => 0,
        'uuid' => new_public_id(),
    ]);
    echo "✅ Successfully created Coolify Project: " . $project->name . " (uuid: " . $project->uuid . ")" . PHP_EOL;
} else {
    echo "ℹ️ Project exists: " . $project->name . " (uuid: " . $project->uuid . ")" . PHP_EOL;
}

$env = $project->environments()->where('name', 'production')->first();
if (!$env) {
    $env = Environment::create([
        'name' => 'production',
        'project_id' => $project->id,
        'uuid' => new_public_id(),
    ]);
    echo "✅ Created production environment (uuid: " . $env->uuid . ")" . PHP_EOL;
} else {
    echo "ℹ️ Found production environment (uuid: " . $env->uuid . ")" . PHP_EOL;
}

// 2. Destination & Git Source
$destination = StandaloneDocker::where('server_id', 0)->first();
$gitSource = GithubApp::where('name', 'harhmd')->first() ?: GithubApp::where('name', 'Public GitHub')->first();

// 3. Create or Update Application 'loayltycardjam'
$appInstance = Application::where('name', 'loayltycardjam')->orWhere('name', 'loyaltycardjam')->first();
$repoPath = 'harhmd/loyaltycardjam';
$fqdn = 'https://loyaltycardjam.65-75-201-219.sslip.io,http://65.75.201.219:8090';

if (!$appInstance) {
    $appInstance = new Application([
        'name' => 'loayltycardjam',
        'description' => 'JAM Loyalty Card - React Vite PWA Portal for Buyers, Sellers & Organizers',
        'git_repository' => $repoPath,
        'git_branch' => 'main',
        'ports_exposes' => '80',
        'ports_mappings' => '8090:80',
        'fqdn' => $fqdn,
        'environment_id' => $env->id,
        'destination_id' => $destination->id,
        'destination_type' => $destination->getMorphClass(),
        'source_id' => $gitSource ? $gitSource->id : null,
        'source_type' => $gitSource ? $gitSource->getMorphClass() : null,
        'build_pack' => 'dockerfile',
        'base_directory' => '/',
        'health_check_enabled' => false,
    ]);
    $appInstance->save();
    echo "✅ Created Application: " . $appInstance->name . " (uuid: " . $appInstance->uuid . ")" . PHP_EOL;
} else {
    $appInstance->git_repository = $repoPath;
    $appInstance->git_branch = 'main';
    $appInstance->build_pack = 'dockerfile';
    $appInstance->ports_exposes = '80';
    $appInstance->ports_mappings = '8090:80';
    $appInstance->fqdn = $fqdn;
    $appInstance->source_id = $gitSource ? $gitSource->id : null;
    $appInstance->source_type = $gitSource ? $gitSource->getMorphClass() : null;
    $appInstance->save();
    echo "ℹ️ Updated Application: " . $appInstance->name . " (uuid: " . $appInstance->uuid . ", git: " . $appInstance->git_repository . ")" . PHP_EOL;
}

// 4. Set Environment Variables
$envVars = [
    'NODE_ENV' => 'production',
    'DATABASE_URL' => 'postgresql://postgres:PG18_Admin_9a8f7d@postgres18-xqromzklsqsmfiaqiz6hbe3d:5432/jamcard_db',
    'DB_HOST' => '65.75.201.219',
    'DB_PORT' => '5432',
    'DB_NAME' => 'jamcard_db',
    'DB_USER' => 'postgres',
    'DB_PASSWORD' => 'PG18_Admin_9a8f7d',
    'DB_PREFIX' => 'Jamcard_',
    'VITE_APP_NAME' => 'Sistem Kad Kesetiaan Jualan Agro MADANI',
];

foreach ($envVars as $key => $val) {
    $existing = EnvironmentVariable::where('resourceable_id', $appInstance->id)
        ->where('resourceable_type', Application::class)
        ->where('key', $key)
        ->first();
    if ($existing) {
        $existing->value = $val;
        $existing->save();
    } else {
        EnvironmentVariable::create([
            'key' => $key,
            'value' => $val,
            'is_buildtime' => true,
            'is_runtime' => true,
            'is_preview' => false,
            'resourceable_type' => Application::class,
            'resourceable_id' => $appInstance->id,
        ]);
    }
}
echo "✅ Synchronized environment variables (Database & Prefix: Jamcard_)" . PHP_EOL;

// 5. Trigger Deployment
$deploymentUuid = new_public_id();
echo "🚀 Queueing deployment: " . $deploymentUuid . " for " . $appInstance->name . PHP_EOL;
queue_application_deployment(
    application: $appInstance,
    deployment_uuid: $deploymentUuid,
    force_rebuild: true
);
echo "DEPLOYMENT_UUID=" . $deploymentUuid . PHP_EOL;
echo "APP_UUID=" . $appInstance->uuid . PHP_EOL;
echo "PROJECT_UUID=" . $project->uuid . PHP_EOL;
echo "COOLIFY_URL=http://65.75.201.219:8000/project/" . $project->uuid . "/production/application/" . $appInstance->uuid . PHP_EOL;
