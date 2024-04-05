#include <Arduino.h>
#if defined(ESP32)
#include <WiFi.h>
#elif defined(ESP8266)
#include <ESP8266WiFi.h>
#endif
#include <Firebase_ESP_Client.h>
#include <Wire.h>
#include <Adafruit_INA219.h>

// Provide the token generation process info.
#include "addons/TokenHelper.h"

// Provide the RTDB payload printing info and other helper functions.
#include "addons/RTDBHelper.h"

// Insert your network credentials
#define WIFI_SSID "WhoWasInParis"
#define WIFI_PASSWORD "nigger69"

// Insert Firebase project API Key
#define API_KEY "AIzaSyDzFB3vK98lI9WjRKBBMmUzmwyD7yxVFD4"

// Insert RTDB URL
#define DATABASE_URL "https://wattswap-953a8-default-rtdb.asia-southeast1.firebasedatabase.app/"

// Define Firebase Data object
FirebaseData fbdo;

FirebaseAuth auth;
FirebaseConfig config;

unsigned long sendDataPrevMillis = 0;
bool signupOK = false;

// Initialize the INA219 sensor
Adafruit_INA219 ina219;

void setup() {
  Serial.begin(9600);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();

  // Initialize the INA219 sensor
  if (!ina219.begin()) {
    Serial.println("Failed to find INA219 chip");
    while (1) { delay(10); }
  }

  // Assign the API key
  config.api_key = API_KEY;

  // Assign the RTDB URL
  config.database_url = DATABASE_URL;

  // Sign up
  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("ok");
    signupOK = true;
  } else {
    Serial.printf("%s\n", config.signer.signupError.message.c_str());
  }

  // Assign the callback function for the long running token generation task
  config.token_status_callback = tokenStatusCallback; // see addons/TokenHelper.h

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {
  if (Firebase.ready() && signupOK && (millis() - sendDataPrevMillis > 15000 || sendDataPrevMillis == 0)) {
    sendDataPrevMillis = millis();

    // Read the voltage from INA219 sensor
    float voltage = ina219.getBusVoltage_V();
    float current = ina219.getCurrent_mA(); // Convert milliamps to amps

    // Calculate power (in watts)
    float power = voltage * current;


    // Send the voltage data to Firebase
    if (Firebase.RTDB.setFloat(&fbdo, "/LED/power/", power)) {
      Serial.println("Voltage sent to Firebase: " + String(power) + " mW");
      Serial.println("Current:" + String(current));
    } else {
      Serial.println("Failed to send voltage to Firebase");
      Serial.println(fbdo.errorReason());
    }
        // Send the current data to Firebase
    if (Firebase.RTDB.setFloat(&fbdo, "/LED/current", current)) {
      Serial.println("Current sent to Firebase: " + String(current) + " mA");
    } else {
      Serial.println("Failed to send current to Firebase");
      Serial.println(fbdo.errorReason());
    }

    // Send the voltage data to Firebase
    if (Firebase.RTDB.setFloat(&fbdo, "/LED/voltage", voltage)) {
      Serial.println("Voltage sent to Firebase: " + String(voltage) + " V");
    } else {
      Serial.println("Failed to send voltage to Firebase");
      Serial.println(fbdo.errorReason());
    }
  }
}
