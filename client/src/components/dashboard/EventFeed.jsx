import React from 'react';
import './EventFeed.css';

const EventFeed = ({ events }) => {
  const getEventIcon = (source) => {
    switch (source) {
      case 'sensor': return '📊';
      case 'relay': return '⚡';
      case 'transaction': return '💱';
      case 'system': return '⚙️';
      case 'error': return '❌';
      default: return '📝';
    }
  };

  const getEventColor = (level) => {
    switch (level) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div className="event-feed">
      <h3 className="event-feed-title">Live Event Feed</h3>
      <div className="event-list">
        {events.length > 0 ? (
          events.map((event, index) => (
            <div key={index} className={`event-item ${getEventColor(event.level)}`}>
              <div className="event-icon">{getEventIcon(event.source)}</div>
              <div className="event-content">
                <div className="event-message">{event.message}</div>
                <div className="event-time">{formatTime(event.timestamp)}</div>
              </div>
              <div className="event-source">{event.source}</div>
            </div>
          ))
        ) : (
          <div className="event-empty">No events yet</div>
        )}
      </div>
    </div>
  );
};

export default EventFeed;
