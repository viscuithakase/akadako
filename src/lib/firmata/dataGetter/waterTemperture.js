export default class WaterTempertureGetter {
  constructor(board) {
    this.board = board

     
    /**
          * Cached water temperature A.
          * @type {?number}
          */
    this.waterTempA = null
 
    /**
           * Last updated time of water temperature A.
           * @type {number} [milliseconds]
           */
    this.waterTempAUpdatedTime = 0
  
    /**
           * Interval time for water temperature A updating.
           * @type {number} [milliseconds]
           */
    this.waterTempAUpdateIntervalTime = 100

    /**
          * Cached water temperature B.
          * @type {?number}
          */
    this.waterTempB = null
 
    /**
            * Last updated time of water temperature B.
            * @type {number} [milliseconds]
            */
    this.waterTempBUpdatedTime = 0
   
    /**
            * Interval time for water temperature B updating.
            * @type {number} [milliseconds]
            */
    this.waterTempBUpdateIntervalTime = 100
  }
  
  /**
     * Get water temp [℃] by sensor on the pin.
     * @param {number} pin - pin number for the sensor
     * @returns {Promise<number>} a Promise which resolves temperature [℃]
     */
  getWaterTemp (pin) {
    if ((this.board.version.type === 0)) {
      return this.board.getTemperatureDS18B20(pin)
    }
    // MidiDako v1.0.0 or later
    return this.board.getWaterTemp(pin)
      .then(data => data / 10)
  }

  /**
     * Get water temperature on Digital A1.
     *
     * @param {object} _args - the block's arguments.
     * @param {BlockUtility} util - utility object provided by the runtime.
     * @returns {?Promise<number | string>} a Promise which resolves temperature [℃] or empty string if it was fail
     */
  async getWaterTemperatureA () {
    if (!this.board.isConnected()) return Promise.resolve(null)
    let getter = Promise.resolve(this.waterTempA)
    if ((Date.now() - this.waterTempAUpdatedTime) > this.waterTempAUpdateIntervalTime) {
      if (this.waterTempAUpdating) {
        await new Promise(resolve => setTimeout(resolve, 5))
        return this.getWaterTemperatureA()
      }
      this.waterTempAUpdating = true
      getter = getter
        .then(() => this.getWaterTemp(10)) // Digital A1: 10
        .then(waterTempA => {
          this.waterTempA = waterTempA
          this.waterTempAUpdatedTime = Date.now()
          return waterTempA
        })
        .finally(() => {
          this.waterTempAUpdating = false
        })
    }
    return getter
      .catch(reason => {
        console.error(`getting water temperature A was rejected by ${reason}`)
        this.waterTempA = null
        return null
      })
  }

  /**
     * Get water temperature on Digital B1.
     *
     * @param {object} _args - the block's arguments.
     * @param {BlockUtility} util - utility object provided by the runtime.
     * @returns {?Promise<number | string>} a Promise which resolves temperature [℃] or empty string if it was fail
     */
  async getWaterTemperatureB () {
    if (!this.board.isConnected()) return Promise.resolve(null)
    let getter = Promise.resolve(this.waterTempB)
    if ((Date.now() - this.waterTempBUpdatedTime) > this.waterTempBUpdateIntervalTime) {
      if (this.waterTempBUpdating) {
        await new Promise(resolve => setTimeout(resolve, 5))
        return this.getWaterTemperatureB()
      }
      this.waterTempBUpdating = true
      getter = getter
        .then(() => this.getWaterTemp(6)) // Digital B1: 6;
        .then(waterTempB => {
          this.waterTempB = waterTempB
          this.waterTempBUpdatedTime = Date.now()
          return waterTempB
        })
        .finally(() => {
          this.waterTempBUpdating = false
        })
    }
    return getter
      .catch(reason => {
        console.error(`getting water temperature A was rejected by ${reason}`)
        this.waterTempB = null
        return null
      })
  }
}