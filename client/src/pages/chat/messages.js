import styles from './styles.module.css';
import { useState, useEffect, useRef } from 'react';

const Messages = ({ socket }) => {
  const [messagesRecieved, setMessagesReceived] = useState([]);

  const messagesColumnRef = useRef(null);

  // Runs whenever a socket event is recieved from the server
  useEffect(() => {
    socket.on('receive_message', (data) => {
      console.log(data);
      setMessagesReceived((state) => [
        ...state,
        {
          message: data.message,
          username: data.username,
          __createdTime__: data.__createdTime__,
        },
      ]);
    });

    // Remove event listener on component unmount
    return () => socket.off('receive_message');
  }, [socket]);

  useEffect(() => {
    // Last 100 messages sent in the chat room (fetched from the db in backend)
    socket.on('last_50_messages', (last50Messages) => {
      console.log('Last 50 messages:', last50Messages);
      setMessagesReceived((state) => [...last50Messages, ...state]);
    });

    return () => socket.off('last_50_messages');

  }, [socket]);

  // Scroll to the most recent message
  useEffect(() => {
    messagesColumnRef.current.scrollTop =
      messagesColumnRef.current.scrollHeight;
  }, [messagesRecieved]);

  function sortMessagesByDate(messages) {
    return messages.sort(
      (a, b) => parseInt(a.__createdTime__) - parseInt(b.__createdTime__)
    );
  }

  // dd/mm/yyyy, hh:mm:ss
  function formatDateFromTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  return (
    <div className={styles.messagesColumn} ref={messagesColumnRef}>
      {messagesRecieved.map((msg, i) => (
        <div className={styles.message} key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className={styles.msgMeta}>{msg.username}</span>
            <span className={styles.msgMeta}>
              {formatDateFromTimestamp(msg.__createdTime__)}
            </span>
          </div>
          <p className={styles.msgText}>{msg.message}</p>
          <br />
        </div>
      ))}
    </div>
  );
};

export default Messages;
