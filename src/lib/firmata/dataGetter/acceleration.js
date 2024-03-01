import ADXL345 from '../adxl345'
import KXTJ3 from '../kxtj3'

export default class AccelerationGetter {
  constructor(board) {
    this.board = board

    if (this.board) {
      this.adxl345 = new ADXL345(this.board)
      this.kxtj3 = new KXTJ3(this.board)
    }

    this.accelerometer = null
    this.acceleration = null
    this.accelerationUpdateIntervalTime = 100
    this.accelerationUpdatedTime = null
  }

  async getAccelerometer () {
    if (!this.accelerometer) {
      let newSensor = null

      if (this.board.version.type === 2) {
        // STEAM Tool
        newSensor = new KXTJ3(this.board)
      } else {
        newSensor = new ADXL345(this.board)
      }
      await newSensor.init()
      this.accelerometer = newSensor
    }
    return this.accelerometer
  }

  async getAcceleration () {
    try {
      const sensor = await this.getAccelerometer()
      this.acceleration = await sensor.getAcceleration()
      this.accelerationUpdatedTime = Date.now()
      return this.acceleration
    } catch (reason) {
      console.error(`getAcceleration() was rejected by ${reason}`)
      this.acceleration = null
      return null
    }
  }

  async updateAcceleration () {
    let getRequest = Promise.resolve(this.acceleration)
    if ((Date.now() - this.accelerationUpdatedTime) > this.accelerationUpdateIntervalTime) {
      if (this.accelerationUpdating) {
        await new Promise(resolve => setTimeout(resolve, 5))
        return this.updateAcceleration()
      }
      this.accelerationUpdating = true
      getRequest = getRequest
        .then(() => this.getAcceleration())
        .finally(() => {
          this.accelerationUpdating = false
        })
    }
    return getRequest
  }

  /**
     * Get acceleration [m/s^2] for axis X.
     *
     * @param {object} _args - the block's arguments.
     * @param {BlockUtility} util - utility object provided by the runtime.
     * @returns {?Promise<number | string>} a Promise which resolves acceleration or empty string if it was fail
     */
  getAccelerationX () {
    if (!this.board.isConnected()) return null
    const updateAcc = this.updateAcceleration()
    if ((typeof updateAcc) === 'undefined') return null
    return updateAcc
      .then(acc => {
        if (!acc) return null
        return (Math.round(acc.x * 100)) / 100
      })
  }

  /**
     * Get acceleration [m/s^2] for axis Y.
     *
     * @param {object} _args - the block's arguments.
     * @param {BlockUtility} util - utility object provided by the runtime.
     * @returns {?Promise<number | string>} a Promise which resolves acceleration or empty string if it was fail
     */
  getAccelerationY () {
    if (!this.board.isConnected()) return null
    const updateAcc = this.updateAcceleration()
    if ((typeof updateAcc) === 'undefined') return null // re-try thread
    return updateAcc
      .then(acc => {
        if (!acc) return null
        return (Math.round(acc.y * 100)) / 100
      })
  }

  /**
     * Get acceleration [m/s^2] for axis Z.
     *
     * @param {object} _args - the block's arguments.
     * @param {BlockUtility} util - utility object provided by the runtime.
     * @returns {?Promise<number | string>} a Promise which resolves acceleration or empty string if it was fail
     */
  getAccelerationZ () {
    if (!this.board.isConnected()) return null
    const updateAcc = this.updateAcceleration()
    if ((typeof updateAcc) === 'undefined') return // re-try thread
    return updateAcc
      .then(acc => {
        if (!acc) return null
        return (Math.round(acc.z * 100)) / 100
      })
  }

  /**
     * Get absolute acceleration [m/s^2].
     *
     * @param {object} _args - the block's arguments.
     * @param {BlockUtility} util - utility object provided by the runtime.
     * @returns {?Promise<number | string>} a Promise which resolves acceleration or empty string if it was fail
     */
  getAccelerationAbsolute () {
    if (!this.board.isConnected()) return null
    const updateAcc = this.updateAcceleration()
    if ((typeof updateAcc) === 'undefined') return null // re-try thread
    return updateAcc
      .then(acc => {
        if (!acc) return null
        const absolute = Math.sqrt(
          (acc.x ** 2) +
                    (acc.y ** 2) +
                    (acc.z ** 2)
        )
        return (Math.round(absolute * 100)) / 100
      })
  }

  /**
     * Get roll [degree] from accelerometer.
     *
     * @param {object} _args - the block's arguments.
     * @param {BlockUtility} util - utility object provided by the runtime.
     * @returns {?Promise<number | string>} a Promise which resolves roll or empty string if it was fail
     */
  getRoll () {
    if (!this.board.isConnected()) return null
    const updateAcc = this.updateAcceleration()
    if ((typeof updateAcc) === 'undefined') return null // re-try thread
    return updateAcc
      .then(acc => {
        if (!acc) return null
        const roll = Math.atan2(acc.y, acc.z) * 180.0 / Math.PI
        return (Math.round(roll * 100)) / 100
      })
  }

  /**
     * Get pitch [degree] from accelerometer.
     *
     * @param {object} _args - the block's arguments.
     * @param {BlockUtility} util - utility object provided by the runtime.
     * @returns {?Promise<number |string>} a Promise which resolves pitch or empty string if it was fail
     */
  getPitch () {
    if (!this.board.isConnected()) return null
    const updateAcc = this.updateAcceleration()
    if ((typeof updateAcc) === 'undefined') return null // re-try thread
    return updateAcc
      .then(acc => {
        if (!acc) return null
        const angle = Math.atan2(
          acc.x,
          Math.sqrt((acc.y * acc.y) + (acc.z * acc.z))
        ) * 180.0 / Math.PI
        let pitch = angle
        if (acc.z < 0) {
          pitch = ((angle > 0) ? 180 : -180) - angle
        }
        return (Math.round(pitch * 100)) / 100
      })
  }
}