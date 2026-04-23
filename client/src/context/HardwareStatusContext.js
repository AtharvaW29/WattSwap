import { createContext, useReducer, useEffect } from 'react';
import { database } from '../firebaseConfig';
import { ref, onValue } from 'firebase/database';

export const HardwareStatusContext = createContext();

const initialState = {
  // Hardware state
  battery: {
    soc: 0,
    voltage: 0,
    current: 0,
    temperature: 0
  },
  output: {
    power: 0,
    voltage: 0,
    current: 0,
    relayStatus: 'OFF'
  },
  relay: {
    state: 'OFF',
    timeElapsed: 0,
    timeRemaining: 0
  },
  
  // Transaction state
  transaction: {
    orderId: null,
    status: 'idle', // idle, pending, active, completed, failed
    energyRequested: 0,
    energyDelivered: 0,
    startTime: null,
    completionTime: null
  },
  
  // System mode
  systemMode: 'Idle', // Idle, Buyer Request Received, Payment Confirmed, Relay ON, Energy Transfer Active, Completed, Fault
  
  // Events
  events: [], // Circular buffer of last 50 events
  
  // System health
  systemHealth: {
    simulatorConnected: false,
    serverConnected: true,
    databaseSync: false,
    blockchainSync: false
  },
  
  // Metadata
  lastUpdated: null,
  deviceId: 'seller_device_001'
};

function hardwareReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_HARDWARE':
      return {
        ...state,
        battery: action.payload.battery || state.battery,
        output: action.payload.output || state.output,
        relay: action.payload.relay || state.relay,
        lastUpdated: Date.now(),
        systemHealth: {
          ...state.systemHealth,
          databaseSync: true
        }
      };

    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transaction: { ...state.transaction, ...action.payload },
        lastUpdated: Date.now()
      };

    case 'UPDATE_SYSTEM_MODE':
      return {
        ...state,
        systemMode: action.payload,
        lastUpdated: Date.now()
      };

    case 'ADD_EVENT':
      const newEvents = [action.payload, ...state.events].slice(0, 50); // Keep last 50
      return {
        ...state,
        events: newEvents,
        lastUpdated: Date.now()
      };

    case 'UPDATE_SYSTEM_HEALTH':
      return {
        ...state,
        systemHealth: { ...state.systemHealth, ...action.payload }
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

export const HardwareStatusProvider = ({ children, deviceId = 'seller_device_001' }) => {
  const [state, dispatch] = useReducer(hardwareReducer, {
    ...initialState,
    deviceId
  });

  // Subscribe to Firebase real-time updates
  useEffect(() => {
    let unsubscribers = [];

    // Listen to legacy /LED path for backward compatibility
    const ledRef = ref(database, '/LED');
    const unsubscribeLED = onValue(
      ledRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          dispatch({
            type: 'UPDATE_HARDWARE',
            payload: {
              output: {
                power: Math.round(data.power || 0),
                voltage: Math.round(data.voltage * 100) / 100 || 0,
                current: Math.round(data.current * 100) / 100 || 0,
                relayStatus: data.current > 0 ? 'ON' : 'OFF'
              }
            }
          });

          dispatch({
            type: 'ADD_EVENT',
            payload: {
              timestamp: Date.now(),
              source: 'sensor',
              message: `Power: ${Math.round(data.power || 0)}W`,
              level: 'info'
            }
          });

          // Update system mode based on power
          const power = data.power || 0;
          let mode = 'Idle';
          if (power > 100) {
            mode = 'Energy Transfer Active';
          }
          dispatch({ type: 'UPDATE_SYSTEM_MODE', payload: mode });
        }
      },
      (error) => {
        console.warn('Firebase /LED listener error:', error);
        dispatch({
          type: 'UPDATE_SYSTEM_HEALTH',
          payload: { databaseSync: false }
        });
      }
    );
    unsubscribers.push(unsubscribeLED);

    // Listen to device-specific paths
    const batteryRef = ref(database, `/devices/${deviceId}/battery`);
    const unsubscribeBattery = onValue(
      batteryRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          dispatch({
            type: 'UPDATE_HARDWARE',
            payload: { battery: data }
          });
        }
      },
      (error) => console.warn('Battery listener error:', error)
    );
    unsubscribers.push(unsubscribeBattery);

    const relayRef = ref(database, `/devices/${deviceId}/relay`);
    const unsubscribeRelay = onValue(
      relayRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          dispatch({
            type: 'UPDATE_HARDWARE',
            payload: { relay: data }
          });

          if (data.state === 'ON') {
            dispatch({
              type: 'ADD_EVENT',
              payload: {
                timestamp: Date.now(),
                source: 'relay',
                message: 'Relay activated',
                level: 'success'
              }
            });
            dispatch({ type: 'UPDATE_SYSTEM_MODE', payload: 'Relay ON' });
          }
        }
      },
      (error) => console.warn('Relay listener error:', error)
    );
    unsubscribers.push(unsubscribeRelay);

    const transactionRef = ref(database, `/devices/${deviceId}/transaction`);
    const unsubscribeTransaction = onValue(
      transactionRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          dispatch({
            type: 'UPDATE_TRANSACTION',
            payload: {
              orderId: data.order_id,
              status: data.status,
              energyRequested: data.energy_requested_kwh || 0,
              energyDelivered: data.energy_delivered_kwh || 0,
              completionTime: data.completed_at
            }
          });

          if (data.status === 'completed') {
            dispatch({
              type: 'ADD_EVENT',
              payload: {
                timestamp: Date.now(),
                source: 'transaction',
                message: `Energy delivery completed: ${data.energy_delivered_kwh || 0} kWh delivered`,
                level: 'success'
              }
            });
            dispatch({ type: 'UPDATE_SYSTEM_MODE', payload: 'Transfer Completed' });
          }
        }
      },
      (error) => console.warn('Transaction listener error:', error)
    );
    unsubscribers.push(unsubscribeTransaction);

    // Mark simulator as connected
    dispatch({
      type: 'UPDATE_SYSTEM_HEALTH',
      payload: { simulatorConnected: true, databaseSync: true }
    });

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [deviceId]);

  return (
    <HardwareStatusContext.Provider value={{ state, dispatch }}>
      {children}
    </HardwareStatusContext.Provider>
  );
};
