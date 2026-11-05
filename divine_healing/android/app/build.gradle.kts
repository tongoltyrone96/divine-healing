import java.util.Properties
import java.io.FileInputStream

plugins {
    id("com.android.application")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

// Load release signing config from key.properties (gitignored).
// Falls back to debug signing if key.properties is missing so that
// `flutter run` still works out of the box.
val keystoreProperties = Properties()
val keystorePropertiesFile = rootProject.file("key.properties")
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(FileInputStream(keystorePropertiesFile))
}

android {
    namespace = "com.divinehealing.app"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = flutter.ndkVersion

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    defaultConfig {
        applicationId = "com.divinehealing.app"
        // audio_service + Supabase Flutter both need at least API 21.
        minSdk = flutter.minSdkVersion
        targetSdk = flutter.targetSdkVersion
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }

    signingConfigs {
        create("release") {
            if (keystorePropertiesFile.exists()) {
                keyAlias = keystoreProperties["keyAlias"] as String
                keyPassword = keystoreProperties["keyPassword"] as String
                storePassword = keystoreProperties["storePassword"] as String

                // storeFile is written by hand into key.properties, which sits
                // in android/ while file() resolves against android/app/. Both
                // "upload-keystore.jks" and "app/upload-keystore.jks" are
                // plausible things to write there, and the wrong one fails
                // late with a doubled path — android/app/app/… — that reads
                // like a missing file rather than a misread setting.
                val configured = keystoreProperties["storeFile"] as String
                val candidates = listOf(
                    file(configured),
                    rootProject.file(configured),
                    File(configured)
                )
                storeFile = candidates.firstOrNull { it.exists() }
                    ?: throw GradleException(
                        "Keystore '$configured' from key.properties was not found. " +
                        "Looked in: " + candidates.joinToString { it.absolutePath }
                    )
            }
        }
    }

    buildTypes {
        release {
            signingConfig = if (keystorePropertiesFile.exists()) {
                signingConfigs.getByName("release")
            } else {
                signingConfigs.getByName("debug")
            }
            isMinifyEnabled = false
            isShrinkResources = false
        }
    }
}

kotlin {
    compilerOptions {
        jvmTarget = org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17
    }
}

flutter {
    source = "../.."
}

// Firebase Analytics (Google Ads conversion tracking). The Google Services
// plugin reads google-services.json and fails the build if it is missing, so
// it is applied only once that file is in place. To activate analytics, drop
// google-services.json into android/app/ — no gradle edit needed.
if (file("google-services.json").exists()) {
    apply(plugin = "com.google.gms.google-services")
}
