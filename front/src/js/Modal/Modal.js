import Chat from '../Chat/Chat';
import ChatAPI from '../api/ChatAPI';

import './modal.css';

export default class Modal {
    constructor(container) {
        if (!(container instanceof HTMLElement)) {
            throw new Error('container is not HTMLElement');
        }
        this.container = container;
        this.chatAPI = new ChatAPI('new-user');
    }

    init() {
        this.render();
        this.bindEvents();
    }

    render() {
        this.container.innerHTML = `
      <div id="modal" class="modal">
        <div class="modal-content">
            <h2>Choose a Nickname</h2>
            <input type="text" id="nickname" class="nickname" placeholder="Nickname" />
            <br />
            <button id="submit">Продолжить</button>
        </div>
        <div class="error-container"></div>
      </div>
    `;
    }

    bindEvents() {
        this.container
            .querySelector('#submit')
            .addEventListener('click', this.handleSubmit.bind(this));
        this.container
            .querySelector('#nickname')
            .addEventListener('click', this.handleNicknameClick.bind(this));
    }

    async handleSubmit() {
        const nickname = this.container.querySelector('#nickname').value;

        if (!nickname) {
            this.showError('Please enter a nickname');
            return;
        }

        try {
            const result = await this.chatAPI.createNewUser(nickname);

            if (result.status === 'ok') {
                Modal.initializeChat(result.user);
            } else {
                this.showError(result.message);
            }
        } catch (error) {
            this.showError('An error occurred');
        }
    }

    handleNicknameClick() {
        this.hideError();
    }

    static async initializeChat(user) {
        const chat = new Chat(document.getElementById('root'));
        await chat.init(user);
    }

    showError(message) {
        const error = this.container.querySelector('.error-container');
        error.textContent = message;
        error.style.display = 'block';
    }

    hideError() {
        this.container.querySelector('.error-container').style.display = 'none';
    }
}