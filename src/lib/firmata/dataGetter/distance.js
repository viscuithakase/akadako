import VL53L0X from '../vl53l0x'

export default class DistanceGetter {
  constructor(board) {
    this.board = board

    /**
         * Cached optical distance.
         * @type {?number}
         */
    this.opticalDistance = null

    /**
         * Last updated time of optical distance.
         * @type {number} [milliseconds]
         */
    this.opticalDistanceUpdatedTime = 0

    /**
         * Interval time for optical distance updating.
         * @type {number} [milliseconds]
         */
    this.opticalDistanceUpdateIntervalTime = 100

    /**
         * Cached sonic distance A.
         * @type {?number}
         */
    this.sonicDistanceA = null

    /**
          * Last updated time of sonic distance A.
          * @type {number} [milliseconds]
          */
    this.sonicDistanceAUpdatedTime = 0
 
    /**
          * Interval time for sonic distance updating A.
          * @type {number} [milliseconds]
          */
    this.sonicDistanceAUpdateIntervalTime = 100

    /**
         * Cached sonic distance B.
         * @type {?number}
         */
    this.sonicDistanceB = null

    /**
          * Last updated time of sonic distance B.
          * @type {number} [milliseconds]
          */
    this.sonicDistanceBUpdatedTime = 0
 
    /**
          * Interval time for sonic distance updating B.
          * @type {number} [milliseconds]
          */
    this.sonicDistanceBUpdateIntervalTime = 100
  }

  async getOpticalDistanceSensor () {
    if (!this.vl53l0x) {
      let address = 0x08 // STEAM Tool v2.0.1 or later
      if ((this.board.version.type <= 1) ||
            (this.board.version.type === 2 && this.board.version.major === 0 && this.board.version.minor === 0)) {
        address = null
      }
      const newSensor = new VL53L0X(this.board, address)
      const found = await newSensor.init(true)
      if (!found) {
        console.log('Distance sensor (laser) is not found.')
        return null
      }
      await newSensor.setRangeProfile('LONG_RANGE')
      await newSensor.startContinuous()
      this.vl53l0x = newSensor
    }
    return this.vl53l0x
  }

  /**
     * Measure distance using ToF sensor VL53L0X.
     *
     * @param {object} _args - the block's arguments.
     * @param {BlockUtility} util - utility object provided by the runtime.
     * @returns {Promise<number | null>} a Promise which resolves distance [cm] or null if it was fail
     */
  async measureDistanceWithLight () {
    if (!this.board.isConnected()) return Promise.resolve(null)
    let measureRequest = Promise.resolve(this.opticalDistance)
    if ((Date.now() - this.opticalDistanceUpdatedTime) > this.opticalDistanceUpdateIntervalTime) {
      if (this.opticalDistanceUpdating) {
        await new Promise(resolve => setTimeout(resolve, 5))
        return this.measureDistanceWithLight()
      }
      this.opticalDistanceUpdating = true
      measureRequest = measureRequest
        .then(() => this.getOpticalDistanceSensor())
        .then(sensor => sensor.readRangeContinuousMillimeters())
        .then(distance => {
          // STEAM Tool supplement: - 50[mm]
          distance = distance - 50
          // STEAM Tool limit: 100 - 2000[mm]
          return Math.max(100, Math.min(distance, 2000))
        })
        .then(distance => {
          this.opticalDistance = distance
          return distance
        })
        .finally(() => {
          this.opticalDistanceUpdating = false
        })
    }
    return measureRequest
      .then(distance => distance / 10) // convert unit [mm] to [cm]
      .catch(reason => {
        console.error(`measureDistanceWithLight was rejected by ${reason}`)
        this.opticalDistance = null
        return null
      })
  }

  /**
     * Measure distance using ultrasonic sensor on Digital A.
     * @param {object} _args - the block's arguments.
     * @param {BlockUtility} util - utility object provided by the runtime.
     * @returns {Promise<number | null>} a Promise which resolves distance [cm] or null if it was fail
     */
  async measureDistanceWithUltrasonicA () {
    if (!this.board.isConnected()) return Promise.resolve(null)
    let getter = Promise.resolve(this.sonicDistanceA)
    if ((Date.now() - this.sonicDistanceAUpdatedTime) > this.sonicDistanceAUpdateIntervalTime) {
      if (this.sonicDistanceAUpdating) {
        await new Promise(resolve => setTimeout(resolve, 5))
        return this.measureDistanceWithUltrasonicA()
      }
      this.sonicDistanceAUpdating = true
      const pin = 10
      getter = getter.then(() => this.board.getDistanceByUltrasonic(pin))
        .then(value => {
          this.sonicDistanceA = value
          this.sonicDistanceAUpdatedTime = Date.now()
          return this.sonicDistanceA
        })
        .finally(() => {
          this.sonicDistanceAUpdating = false
        })
    }
    return getter
      .then(value => Math.min(350, Math.round(value / 10)))
      .catch(reason => {
        console.error(`ultrasonic distance A was rejected by ${reason}`)
        return null
      })
  }

  /**
     * Measure distance using ultrasonic sensor on Digital B.
     * @param {object} _args - the block's arguments.
     * @param {BlockUtility} util - utility object provided by the runtime.
     * @returns {Promise<number | null>} a Promise which resolves distance [cm] or null if it was fail
     */
  async measureDistanceWithUltrasonicB () {
    if (!this.board.isConnected()) return Promise.resolve(null)
    let getter = Promise.resolve(this.sonicDistanceB)
    if ((Date.now() - this.sonicDistanceBUpdatedTime) > this.sonicDistanceBUpdateIntervalTime) {
      if (this.sonicDistanceBUpdating) {
        await new Promise(resolve => setTimeout(resolve, 5))
        return this.measureDistanceWithUltrasonicB()
      }
      this.sonicDistanceBUpdating = true
      const pin = 6
      getter = getter.then(() => this.board.getDistanceByUltrasonic(pin))
        .then(value => {
          this.sonicDistanceB = value
          this.sonicDistanceBUpdatedTime = Date.now()
          return this.sonicDistanceB
        })
        .finally(() => {
          this.sonicDistanceBUpdating = false
        })
    }
    return getter
      .then(value => Math.min(350, Math.round(value / 10)))
      .catch(reason => {
        console.error(`ultrasonic distance B was rejected by ${reason}`)
        return null
      })
  }
}