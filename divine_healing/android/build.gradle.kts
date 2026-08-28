allprojects {
    repositories {
        // Optional local mirror, searched first. Flutter resolves its engine
        // artifacts from storage.googleapis.com, and on a connection that
        // stalls large transfers Gradle's resolver gives up where a retrying
        // downloader would not. automation/wsl/07_prefetch_flutter_engine.sh
        // fetches them and sets this property in the user's Gradle home, so
        // the path stays out of the repository and the build is unchanged
        // anywhere the property is absent.
        val engineRepo = providers.gradleProperty("flutterEngineRepo").orNull
        if (engineRepo != null) {
            maven { url = uri(engineRepo) }
        }
        google()
        mavenCentral()
    }
}

val newBuildDir: Directory =
    rootProject.layout.buildDirectory
        .dir("../../build")
        .get()
rootProject.layout.buildDirectory.value(newBuildDir)

subprojects {
    val newSubprojectBuildDir: Directory = newBuildDir.dir(project.name)
    project.layout.buildDirectory.value(newSubprojectBuildDir)
}
subprojects {
    project.evaluationDependsOn(":app")
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
