import BME280 from '../bme280'

export default class EnvSensorGetter {
  constructor(board) {
    this.board = board

    /**
         * Environment sensor BME280
         * @type {BME280}
         */
    this.envSensor = null

    /**
         * Cached environment temperature.
         * @type {?number}
         */
    this.envTemperature = null

    /**
          * Last updated time of environment temperature.
          * @type {number} [milliseconds]
          */
    this.envTemperatureUpdatedTime = 0
 
    /**
           * Interval time for environment temperature updating.
           * @type {number} [milliseconds]
           */
    this.envTemperatureUpdateIntervalTime = 100

    /**
         * Cached environment pressure.
         * @type {?number}
         */
    this.envPressure = null

    /**
           * Last updated time of environment pressure.
           * @type {number} [milliseconds]
           */
    this.envPressureUpdatedTime = 0
  
    /**
            * Interval time for environment pressure updating.
            * @type {number} [milliseconds]
            */
    this.envPressureUpdateIntervalTime = 100
   
    /**
         * Cached environment humidity.
         * @type {?number}
         */
    this.envHumidity = null

    /**
            * Last updated time of environment humidity.
            * @type {number} [milliseconds]
            */
    this.envHumidityUpdatedTime = 0
   
    /**
             * Interval time for environment humidity updating.
             * @type {number} [milliseconds]
             */
    this.envHumidityUpdateIntervalTime = 100
  }

  /**
     * Get instance of an environment sensor.
     *
     * @returns {Promise} A Promise which resolves a sensor.
     */
  async getEnvSensor () {
    if (!this.envSensor) {
      const newSensor = new BME280(this.board)
      await newSensor.init()
      this.envSensor = newSensor
    }
    return this.envSensor
  }

  /**
     * Get temperature [℃] from environment sensor.
     * @param {object} _args - the block's arguments.
     * @param {BlockUtility} util - utility object provided by the runtime.
     * @returns {Promise<number | null>} a Promise which resolves temp or null if it was fail
     */
  async getEvnTemperature () {
    if (!this.board.isConnected()) return Promise.resolve(null)
    let getter = Promise.resolve(this.envTemperature)
    if ((Date.now() - this.envTemperatureUpdatedTime) > this.envTemperatureUpdateIntervalTime) {
      if (this.envTemperatureUpdating) {
        await new Promise(resolve => setTimeout(resolve, 5))
        return this.getEvnTemperature()
      }
      this.envTemperatureUpdating = true
      getter = getter
        .then(() => this.getEnvSensor())
        .then(() => this.envSensor.readTemperature())
        .then(envTemperature => {
          this.envTemperature = envTemperature
          this.envTemperatureUpdatedTime = Date.now()
          return envTemperature
        })
        .finally(() => {
          this.envTemperatureUpdating = false
        })
    }
    return getter
      .then(envTemperature => (Math.round(envTemperature * 100) / 100))
      .catch(reason => {
        console.error(`getting environment temperature was rejected by ${reason}`)
        this.envTemperature = null
        this.envSensor = null
        return null
      })
  }

  /**
     * Get pressure [hPa] from environment sensor.
     * @param {object} _args - the block's arguments.
     * @param {BlockUtility} util - utility object provided by the runtime.
     * @returns {Promise<number | null>} a Promise which resolves pressure or null if it was fail
     */
  async getEnvPressure () {
    let getter = Promise.resolve(this.envPressure)
    if ((Date.now() - this.envPressureUpdatedTime) > this.envPressureUpdateIntervalTime) {
      if (this.envPressureUpdating) {
        await new Promise(resolve => setTimeout(resolve, 5))
        return this.getEvnPressure()
      }
      this.envPressureUpdating = true
      getter = getter
        .then(() => this.getEnvSensor())
        .then(() => this.envSensor.readPressure())
        .then(envPressure => {
          this.envPressure = envPressure
          this.envPressureUpdatedTime = Date.now()
          return envPressure
        })
        .finally(() => {
          this.envPressureUpdating = false
        })
    }
    return getter
      .then(envPressure => (Math.round(envPressure * 100) / 10000))
      .catch(reason => {
        console.error(`getting environment pressure was rejected by ${reason}`)
        this.envPressure = null
        this.envSensor = null
        return null
      })
  }

  /**
     * Get humidity [%] from environment sensor.
     * @param {object} _args - the block's arguments.
     * @param {BlockUtility} util - utility object provided by the runtime.
     * @returns {Promise<number | null>} a Promise which resolves value of humidity or null if it was fail
     */
  async getEnvHumidity () {
    let getter = Promise.resolve(this.envHumidity)
    if ((Date.now() - this.envHumidityUpdatedTime) > this.envHumidityUpdateIntervalTime) {
      if (this.envHumidityUpdating) {
        await new Promise(resolve => setTimeout(resolve, 5))
        return this.getEnvHumidity()
      }
      this.envHumidityUpdating = true
      getter = getter
        .then(() => this.getEnvSensor())
        .then(() => this.envSensor.readHumidity())
        .then(envHumidity => {
          this.envHumidity = envHumidity
          this.envHumidityUpdatedTime = Date.now()
          return envHumidity
        })
        .finally(() => {
          this.envHumidityUpdating = false
        })
    }
    return getter
      .then(envHumidity => (Math.round(envHumidity * 100) / 100))
      .catch(reason => {
        console.error(`getting environment humidity was rejected by ${reason}`)
        this.envHumidity = null
        this.envSensor = null
        return null
      })
  }
}