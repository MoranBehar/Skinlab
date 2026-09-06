import React, { useEffect, useState } from 'react';
import { Badge, Button, Form } from 'react-bootstrap';
import { useAuth } from '../../contexts/authContext';
import { useChat } from '../../contexts/chatContext';
import { chatAPI } from '../../services/chat.api';

const ChatWidget: React.FC = () => {
  const { user } = useAuth();
  const { messages, connected, sendMessage, markRead, loadMessages } = useChat();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    chatAPI
      .getMyMessages()
      .then(loadMessages)
      .catch((error) => console.error('Failed to load chat history:', error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unreadCount = messages.filter(
    (message) => message.sender_id !== user?.user_id && !message.is_read,
  ).length;

  const handleToggle = () => {
    setOpen((prev) => {
      const next = !prev;
      if (next) {
        markRead();
      }
      return next;
    });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) {
      return;
    }
    sendMessage(draft.trim());
    setDraft('');
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1050 }}>
      {open && (
        <div
          style={{
            width: '320px',
            height: '420px',
            marginBottom: '10px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div className="bg-dark text-white p-2 rounded-top d-flex justify-content-between align-items-center">
            <span>Support Chat</span>
            <Button variant="link" size="sm" className="text-white p-0" onClick={handleToggle}>
              <i className="bi bi-x-lg" />
            </Button>
          </div>

          <div className="flex-grow-1 overflow-auto p-2">
            {messages.map((message) => {
              const isMine = message.sender_id === user?.user_id;
              return (
                <div
                  key={message.message_id}
                  className={`d-flex mb-2 ${isMine ? 'justify-content-end' : 'justify-content-start'}`}
                >
                  <div
                    className={`px-2 py-1 rounded ${isMine ? 'bg-primary text-white' : 'bg-light'}`}
                    style={{ maxWidth: '80%' }}
                  >
                    {message.body}
                  </div>
                </div>
              );
            })}
            {messages.length === 0 && (
              <p className="text-muted text-center small mt-3">
                Ask us anything - our support team is here to help.
              </p>
            )}
          </div>

          <Form onSubmit={handleSend} className="p-2 border-top d-flex">
            <Form.Control
              size="sm"
              placeholder="Type a message..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <Button type="submit" size="sm" variant="dark" className="ms-2" disabled={!connected}>
              Send
            </Button>
          </Form>
        </div>
      )}

      <div
        onClick={handleToggle}
        style={{
          position: 'relative',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#212529',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          cursor: 'pointer',
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
          marginLeft: 'auto',
        }}
      >
        <i className="bi bi-chat-dots-fill" />
        {unreadCount > 0 && (
          <Badge
            bg="danger"
            pill
            style={{ position: 'absolute', top: '-4px', right: '-4px', fontSize: '0.7rem' }}
          >
            {unreadCount}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default ChatWidget;
