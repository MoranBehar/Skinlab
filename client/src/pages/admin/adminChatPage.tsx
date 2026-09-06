import React, { useEffect, useState } from 'react';
import { Container, Row, Col, ListGroup, Form, Button, Badge } from 'react-bootstrap';
import { useChat } from '../../contexts/chatContext';
import { chatAPI } from '../../services/chat.api';
import { ConversationSummary } from '../../types/chat.types';

export const AdminChatPage: React.FC = () => {
  const { messages, sendMessage, markRead, loadMessages } = useChat();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    chatAPI
      .getConversations()
      .then(setConversations)
      .catch((error) => console.error('Failed to load conversations:', error));
  }, [messages]);

  const handleSelectConversation = (userId: number) => {
    setSelectedUserId(userId);
    chatAPI
      .getConversationMessages(userId)
      .then(loadMessages)
      .catch((error) => console.error('Failed to load conversation:', error));
    markRead(userId);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || selectedUserId === null) {
      return;
    }
    sendMessage(draft.trim(), selectedUserId);
    setDraft('');
  };

  const conversationMessages =
    selectedUserId === null
      ? []
      : messages.filter((message) => message.user_id === selectedUserId);

  return (
    <Container fluid className="p-4">
      <h3 className="mb-4">Support Conversations</h3>
      <Row>
        <Col md={4}>
          <ListGroup>
            {conversations.map((conversation) => (
              <ListGroup.Item
                key={conversation.user_id}
                action
                active={conversation.user_id === selectedUserId}
                onClick={() => handleSelectConversation(conversation.user_id)}
                className="d-flex justify-content-between align-items-start"
              >
                <div>
                  <div className="fw-bold">{conversation.full_name}</div>
                  <small className="text-muted">{conversation.last_message}</small>
                </div>
                {conversation.unread_count > 0 && (
                  <Badge bg="danger" pill>
                    {conversation.unread_count}
                  </Badge>
                )}
              </ListGroup.Item>
            ))}
            {conversations.length === 0 && (
              <p className="text-muted small">No conversations yet.</p>
            )}
          </ListGroup>
        </Col>

        <Col md={8}>
          {selectedUserId === null ? (
            <p className="text-muted">Select a conversation to view messages.</p>
          ) : (
            <div className="d-flex flex-column" style={{ height: '70vh' }}>
              <div className="flex-grow-1 overflow-auto border rounded p-3 mb-3">
                {conversationMessages.map((message) => {
                  const isFromUser = message.sender_id === selectedUserId;
                  return (
                    <div
                      key={message.message_id}
                      className={`d-flex mb-2 ${isFromUser ? 'justify-content-start' : 'justify-content-end'}`}
                    >
                      <div
                        className={`px-2 py-1 rounded ${isFromUser ? 'bg-light' : 'bg-primary text-white'}`}
                        style={{ maxWidth: '70%' }}
                      >
                        {message.body}
                      </div>
                    </div>
                  );
                })}
              </div>

              <Form onSubmit={handleSend} className="d-flex">
                <Form.Control
                  placeholder="Type a reply..."
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <Button type="submit" variant="dark" className="ms-2">
                  Send
                </Button>
              </Form>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default AdminChatPage;
