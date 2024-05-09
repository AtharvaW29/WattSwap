#if defined(ESP32)
#include <WiFi.h>
#elif defined(ESP8266)
#include <ESP8266WiFi.h>
#endif
#include <Firebase_ESP_Client.h>
#include <Wire.h>
#include <Adafruit_INA219.h>
#include <math.h>

// Provide the token generation process info.
#include "addons/TokenHelper.h"

// Provide the RTDB payload printing info and other helper functions.
#include "addons/RTDBHelper.h"

// Insert your network credentials
#define WIFI_SSID "Sakshi"
#define WIFI_PASSWORD "12345678"

//Relay control pins
// #define RELAY1_PIN 26
#define RELAY_PIN 26

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
bool relayActivated = false;

// Initialize the INA219 sensor
Adafruit_INA219 ina219;

void setup() {
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
  
  // Set relay pins as output
  // pinMode(RELAY1_PIN, OUTPUT);
  pinMode(RELAY_PIN, OUTPUT);
  
  digitalWrite(RELAY_PIN, LOW);
  
   Serial.begin(9600);
  
  delay(500);
}

void loop() {
  if (Firebase.ready() && signupOK && (millis() - sendDataPrevMillis > 15000 || sendDataPrevMillis == 0)) {
    sendDataPrevMillis = millis();

    // Read the voltage from INA219 sensor
    float voltage = ina219.getBusVoltage_V();
    float current = ina219.getCurrent_mA(); // Convert milliamps to amps

    // Calculate power (in watts)
    float power = voltage * current * -1000;


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

    // Set the Checkout Power to 0
    if (Firebase.RTDB.setFloat(&fbdo, "/LED/checkoutPower", 0)) {
      Serial.println("CheckoutPower set to Firebase: ");
    } else {
      Serial.println("Failed to set checkout power to Firebase");
      Serial.println(fbdo.errorReason());
    }

  }
  if(Firebase.ready() && signupOK) {
    if (Firebase.RTDB.getBool(&fbdo, "/LED/checkout")) {
        if (fbdo.dataType() == "boolean") {
            bool checkout = fbdo.boolData();
            if (checkout == true) {
                startTransfer();
            }
            
        }
    }
  }
}

void startTransfer() {
  // Fetch voltage data from Firebase
  float voltage = 4.5;
  // if (Firebase.RTDB.getFloat(&fbdo, "/LED/voltage")) {
  //   voltage = fbdo.floatData();
  //   Serial.println("Fetched Voltage is : " + String(voltage));
  // }

  // Fetch capacity data from Firebase
  float capacity = 0.0;
  if (Firebase.RTDB.getFloat(&fbdo, "/LED/checkoutPower")) {
    capacity = fbdo.floatData();
    Serial.println("Fetched Capacity is : " + String(capacity));
  }

  float timeinhours = capacity / voltage;
  // timeinhours = fmod(timeinhours, 10.0);
  float transferTime = timeinhours * 1000;
  // float transferTime = 10000;
  Serial.print("Transfer time: ");
  Serial.println(transferTime);

  // Control the relay based on the transfer time
  // relayActivated = true; // Set the flag to activate the relay
  // digitalWrite(RELAY_PIN, HIGH); // Turn on relay channel 1

  // unsigned long startTime = millis(); // Record the start time

  // // Keep the relay on until the transfer time is reached
  // while (millis() - startTime < transferTime) {
  //   // Check if the checkout boolean is still true
  //   digitalWrite(RELAY_PIN, HIGH);
  //   if (!Firebase.RTDB.getBool(&fbdo, "/LED/checkout") || !fbdo.boolData()) {
  //     // If the checkout boolean becomes false during transfer, stop the transfer
  //     Serial.println("Checkout cancelled");
  //     relayActivated = false; // Reset the relay activation flag
  //     digitalWrite(RELAY_PIN, LOW);
  //     break;
  //   }
  //   break;
  //   delay(1000); // Adjust the delay to balance accuracy and responsiveness
  // }
  digitalWrite(RELAY_PIN, HIGH); // Turn on relay channel 1
  Serial.print("Relay is HIGH");
  delay(transferTime); // Wait for transfer time duration in milliseconds
  digitalWrite(RELAY_PIN, LOW); // Turn off relay channel 1
  Serial.print("Relay is LOW");



  // Reset checkout status in Firebase
  Firebase.RTDB.setBool(&fbdo, "/LED/checkout", false);
  Firebase.RTDB.setInt(&fbdo, "/LED/checkoutPower", 0);
}
