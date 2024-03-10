import Entity from './Entity';

export default class ChatAPI extends Entity {
  createNewUser(name) {
    return this.create({ name });
  }
}
