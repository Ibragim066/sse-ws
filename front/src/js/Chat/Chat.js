import dayjs from 'dayjs';
import ChatAPI from '../api/ChatAPI';

import './chat.css';

export default class Chat {
  constructor(container) {
    if (!(container instanceof HTMLElement)) {
      throw new Error('container is not HTMLElement');
    }

    this.container = container;
    this.api = new ChatAPI('users');
    this.websocket = null;
    this.user = null;
  }

  async init(user) {
    this.user = user;
    this.bindToDOM();
    this.registerEvents();
    this.onEnterChatHandler();
  }

  bindToDOM() {
    this.container.innerHTML = `
      <div class="user-list">
        <ul></ul>
      </div>
      <div class="chat-window">
        <div class="messages"></div>
        <form class="message-form">
          <input class="message-input" type="text" placeholder="Type your message here">
        </form>
      </div>
    `;

    this.messages = this.container.querySelector('.messages');
  }

  registerEvents() {
    window.addEventListener('beforeunload', () => this.exitChat());
    this.container
      .querySelector('.message-form')
      .addEventListener('submit', (e) => this.onSubmit(e));
  }

  onSubmit(e) {
    e.preventDefault();
    this.sendMessage();
  }

  onEnterChatHandler() {
    this.websocket = new WebSocket('wss://ws-chat-r75q.onrender.com');
    this.subscribeOnEvents();
  }

  subscribeOnEvents() {
    this.websocket.addEventListener('open', () => Chat.handleOpen());
    this.websocket.addEventListener('message', (e) => this.handleMessage(e));
    this.websocket.addEventListener('close', () => Chat.handleClose());
    this.websocket.addEventListener('error', () => Chat.handleError());
  }

  sendMessage() {
    const message = this.getMessageInputValue();
    if (!message) return;

    const payload = {
      type: 'send',
      message: { text: message, time: new Date() },
      user: this.user,
    };
    this.websocket.send(JSON.stringify(payload));
    this.clearMessageInput();
  }

  getMessageInputValue() {
    const input = this.container.querySelector('.message-input');
    return input?.value.trim();
  }

  clearMessageInput() {
    const input = this.container.querySelector('.message-input');
    if (input) input.value = '';
  }

  renderMessage({ user, message }) {
    const { name } = user;
    const { text, time } = message;
    const isCurrentUser = name === this.user.name;

    const messageElement = document.createElement('div');
    messageElement.classList.add('message', isCurrentUser && 'message-user');

    const formattedTime = dayjs(time).format('HH:mm DD.MM.YY');
    const displayName = isCurrentUser ? 'You' : name;

    messageElement.innerHTML = `
      <div class="message-info">
        <span>${displayName}</span>
        <span class="timestamp">${formattedTime}</span>
      </div>
      <div class="text">${text}</div>
    `;

    this.messages.append(messageElement);
    this.scrollToBottom();
  }

  static handleOpen() {
    console.log('Connected to WebSocket server');
  }

  handleMessage(event) {
    const receivedMessage = JSON.parse(event.data);

    if (!receivedMessage.type) {
      this.updateUserList(receivedMessage);
    }
    if (receivedMessage.type === 'send') {
      this.renderMessage(receivedMessage);
    }
  }

  static handleClose() {
    console.log('Disconnected from WebSocket server');
  }

  static handleError(event) {
    console.error(`Error: ${event}`);
  }

  exitChat() {
    const payload = {
      type: 'exit',
      user: this.user,
    };
    this.websocket.send(JSON.stringify(payload));
  }

  updateUserList(users) {
    const usersContainer = this.container.querySelector('.user-list ul');

    usersContainer.innerHTML = users
      .map((user) => {
        const isYou = user.name === this.user.name;

        return `
        <li class=${isYou ? 'you' : ''}>
            <span class="label"></span>
            <span class="user-nickname">${isYou ? 'You' : user.name}</span>
        </li>
    `;
      })
      .join('');
  }

  scrollToBottom() {
    this.messages.scrollTop = this.messages.scrollHeight;
  }
}
