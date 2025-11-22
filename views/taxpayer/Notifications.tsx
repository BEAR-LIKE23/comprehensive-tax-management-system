import React, { useState, useEffect } from 'react';
import { User, Notification } from '../../types';
import { getNotificationsForUser } from '../../services/apiService';

interface NotificationsProps {
  user: User;
}

const Notifications: React.FC<NotificationsProps> = ({ user }) => {
  const [userNotifications, setUserNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      const data = await getNotificationsForUser(user.id);
      setUserNotifications(data);
      setIsLoading(false);
    };
    fetchNotifications();
  }, [user.id]);

  if (isLoading) {
    return <div className="text-center p-8">Loading notifications...</div>;
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Notifications</h2>
      <div className="flow-root">
        <ul role="list" className="-mb-8">
          {userNotifications.length > 0 ? userNotifications.map((notification, notificationIdx) => (
            <li key={notification.id}>
              <div className="relative pb-8">
                {notificationIdx !== userNotifications.length - 1 ? (
                  <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${notification.read ? 'bg-gray-400' : 'bg-green-500'}`}>
                       <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 2a6 6 0 00-6 6c0 1.23.363 2.39 1.002 3.422a.75.75 0 00.123.262l3.532 5.298a.75.75 0 001.29.001l3.533-5.3a.75.75 0 00.122-.262A5.969 5.969 0 0016 8a6 6 0 00-6-6zm0 1.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className="text-sm text-gray-500">{notification.title}</p>
                      <p className="font-medium text-gray-900">{notification.message}</p>
                    </div>
                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                      <time dateTime={notification.date}>{new Date(notification.date).toLocaleDateString()}</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          )) : <p className="text-gray-500">You have no notifications.</p>}
        </ul>
      </div>
    </div>
  );
};

export default Notifications;