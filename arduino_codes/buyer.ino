#include <Arduino.h>
#if defined(ESP32)
#include <WiFi.h>
#elif defined(ESP8266)
#include <ESP8266WiFi.h>
#endif
#include <Firebase_ESP_Client.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <Adafruit_INA219.h>
 
// Provide the token generation process info.
#include "addons/TokenHelper.h"

// Provide the RTDB payload printing info and other helper functions.
#include "addons/RTDBHelper.h"

// Insert your network credentials
#define WIFI_SSID "Sakshi"
#define WIFI_PASSWORD "12345678"

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

//Initilaize the INA219 sensor and lcd display
Adafruit_INA219 ina219;
LiquidCrystal_I2C lcd(0x27, 16, 2);
 
float busvoltage = 0;
float current_mA = 0;
float power_mW = 0;
 
void setup()
{
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

  lcd.init();
  lcd.clear();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("ESP32 Energy");
  lcd.setCursor(0, 1);
  lcd.print("Monitor");
  delay(1000);
 
  if (!ina219.begin())
  {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("FAILED TO FIND");
    lcd.setCursor(0, 0);
    lcd.print("INA219 MODULE");
    Serial.println("FAILED TO FIND INA219 MODULE");
    while (1)
    {
      delay(10);
    }
  }
 
  Serial.begin(115200);
  Serial.println("Initialization complete");
}
 
void loop()
{
  measureValues();
  
  if (Firebase.ready() && signupOK && (millis() - sendDataPrevMillis > 15000 || sendDataPrevMillis == 0)) {
    sendDataPrevMillis = millis();

    // Read the voltage from INA219 sensor
    float voltage = ina219.getBusVoltage_V();
    float current = ina219.getCurrent_mA(); // Convert milliamps to amps

    // Calculate power (in watts)
    float power = voltage * current * -1000;


    // Send the voltage data to Firebase
    if (Firebase.RTDB.setFloat(&fbdo, "/Buyer/power", power)) {
      Serial.println("Power sent to Firebase: " + String(power) + " mW");
      Serial.println("Current:" + String(current));
    } else {
      Serial.println("Failed to send power to Firebase");
      Serial.println(fbdo.errorReason());
    }

        // Send the current data to Firebase
    if (Firebase.RTDB.setFloat(&fbdo, "/Buyer/current", current)) {
      Serial.println("Current sent to Firebase: " + String(current) + " mA");
    } else {
      Serial.println("Failed to send current to Firebase");
      Serial.println(fbdo.errorReason());
    }

    // Send the voltage data to Firebase
    if (Firebase.RTDB.setFloat(&fbdo, "/Buyer/voltage", voltage)) {
      Serial.println("Voltage sent to Firebase: " + String(voltage) + " V");
    } else {
      Serial.println("Failed to send voltage to Firebase");
      Serial.println(fbdo.errorReason());
    }

  }
}
 
void measureValues()
{
  busvoltage = ina219.getBusVoltage_V();
  current_mA = ina219.getCurrent_mA();
  power_mW = ina219.getPower_mW();
 
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("V: ");
  lcd.print(busvoltage);
  lcd.setCursor(0, 1);
  lcd.print("I: ");
 
  // Ensure consistent formatting for current_mA
  if (current_mA < 10)
  {
    lcd.print(" ");
  }
  lcd.print(current_mA, 2); // Print current value with two decimal places
  
  lcd.setCursor(9, 1);
  lcd.print("Pwr(mW):");
  lcd.print((int)power_mW);
  
  Serial.print("Vol: ");
  Serial.print(busvoltage);
  Serial.print("V   Curr: ");
  Serial.print(current_mA);
  Serial.println("mA");
  
  delay(1000);
}