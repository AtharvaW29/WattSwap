import React from 'react';
import './HardwareMeters.css';

const HardwareMeters = ({ battery, output }) => {
  const batteryPercent = Math.round(battery.soc || 0);
  const powerKw = ((output.power || 0) / 1000).toFixed(2);

  return (
    <div className="hardware-meters">
      <div className="meter battery-meter">
        <div className="meter-label">Battery</div>
        <div className="meter-value">{batteryPercent}%</div>
        <div className="meter-bar">
          <div 
            className="meter-fill battery-fill" 
            style={{ width: `${batteryPercent}%` }}
          />
        </div>
        <div className="meter-detail">{battery.voltage?.toFixed(1) || 0}V @ {battery.temperature?.toFixed(1) || 0}°C</div>
      </div>

      <div className="meter power-meter">
        <div className="meter-label">Power Output</div>
        <div className="meter-value">{powerKw} kW</div>
        <div className="meter-bar">
          <div 
            className="meter-fill power-fill" 
            style={{ width: `${Math.min(100, (output.power || 0) / 25)}%` }}
          />
        </div>
        <div className="meter-detail">{output.current?.toFixed(1) || 0}A @ {output.voltage?.toFixed(1) || 0}V</div>
      </div>

      <div className="meter voltage-meter">
        <div className="meter-label">Voltage</div>
        <div className="meter-value">{output.voltage?.toFixed(1) || 0}V</div>
        <div className="meter-bar">
          <div 
            className="meter-fill voltage-fill" 
            style={{ width: `${Math.min(100, (output.voltage || 0) / 0.65)}%` }}
          />
        </div>
        <div className="meter-detail">Range: 40-58V</div>
      </div>

      <div className="meter current-meter">
        <div className="meter-label">Current</div>
        <div className="meter-value">{output.current?.toFixed(1) || 0}A</div>
        <div className="meter-bar">
          <div 
            className="meter-fill current-fill" 
            style={{ width: `${Math.min(100, (output.current || 0) / 0.5)}%` }}
          />
        </div>
        <div className="meter-detail">Max: 50A</div>
      </div>
    </div>
  );
};

export default HardwareMeters;
