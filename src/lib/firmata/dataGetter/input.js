export default class InputGetter {
  constructor(board) {
    this.board = board
  }

  /**
     * The level [0|1] of digital A1 connector
     * @returns {number | string} - digital level or empty string when disconnected
     */
  digitalLevelA1 () {
    if (!this.board.isConnected()) return null
    return this.board.getDigitalValue(10)
  }

  /**
     * The level [0|1] of digital A2 connector
     * @returns {number | string} - digital level or empty string when disconnected
     */
  digitalLevelA2 () {
    if (!this.board.isConnected()) return null
    return this.board.getDigitalValue(11)
  }

  /**
     * The level [0|1] of digital B1 connector
     * @returns {number | string} - digital level or empty string when disconnected
     */
  digitalLevelB1 () {
    if (!this.board.isConnected()) return null
    return this.board.getDigitalValue(6)
  }

  /**
     * The level [0|1] of digital B2 connector
     * @returns {number | string} - digital level or empty string when disconnected
     */
  digitalLevelB2 () {
    if (!this.board.isConnected()) return null
    return this.board.getDigitalValue(9)
  }

  /**
     * The level [%] of analog A1 connector
     * @returns {number | string} - analog level or empty string when disconnected
     */
  analogLevelA1 () {
    if (!this.board.isConnected()) return null
    const raw = this.board.getAnalogValue(0)
    return Math.round((raw / 1023) * 1000) / 10
  }

  /**
     * The level [%] of analog A2 connector
     * @returns {number | string} - analog level or empty string when disconnected
     */
  analogLevelA2 () {
    if (!this.board.isConnected()) return null
    const raw = this.board.getAnalogValue(1)
    return Math.round((raw / 1023) * 1000) / 10
  }

  /**
     * The level [%] of analog B1 connector
     * @returns {number | string} - analog level or empty string when disconnected
     */
  analogLevelB1 () {
    if (!this.board.isConnected()) return null
    const raw = this.board.getAnalogValue(2)
    return Math.round((raw / 1023) * 1000) / 10
  }

  /**
     * The level [%] of analog B2 connector
     * @returns {number | string} - analog level or empty string when disconnected
     */
  analogLevelB2 () {
    if (!this.board.isConnected()) return null
    const raw = this.board.getAnalogValue(3)
    return Math.round((raw / 1023) * 1000) / 10
  }
}