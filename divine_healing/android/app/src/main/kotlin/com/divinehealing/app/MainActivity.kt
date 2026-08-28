package com.divinehealing.app

import com.ryanheise.audioservice.AudioServiceActivity

// AudioServiceActivity, not FlutterActivity: audio_service needs the activity
// to survive being relaunched from the notification, and it hosts the media
// session's Flutter engine.
class MainActivity : AudioServiceActivity()
