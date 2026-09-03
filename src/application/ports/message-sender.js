/**
 * Port for sending a text message to a recipient.
 */
export class MessageSender {
  /**
   * @param {number|string} recipientId
   * @param {string} text
   * @returns {Promise<unknown>}
   */
  async sendMessage(recipientId, text) {
    void recipientId;
    void text;
    throw new Error('MessageSender.sendMessage() must be implemented');
  }
}
