/**
 * O2CO2Sensor は SCD4x と酸素センサーを接続したセンサーです。
 * 
 * SCD4x API
 * 酸素＆二酸化炭素濃度取得のサンプルコード(Scratch)
 * https://xcratch.github.io/editor/#https://akadako.com/xcratch/files/06fe7b7680a26ce38389ac95d70b8fb9/5wgi0ik81sw0swcocg8og8go.sb3
 * データシート
 * https://files.seeedstudio.com/wiki/Grove-CO2&Temperature&HumiditySensor-SCD4/res/Sensirion_CO2_Sensors_SCD4x_Datasheet.pdf
 * https://www.winsen-sensor.com/sensors/o2-sensor/ze03-o2.html
 */


/**
 * SCD4x I2C Address
 */
const I2C_ADDRESS_SCD4x = 0x62

/**
 * O2 Sensor Address
 */
const I2C_ADDRESS_O2_SENSOR = 0x63

/**
 * 短いタイムアウト
 */
const timeout_short = 50

export default class O2CO2Sensor {
  constructor(board) {
    /**
     * Connecting AkaDako board
     * @type {import('./akadako-board').default}
     */
    this.board = board
    this.scd4x = new SCD4x(board)
  }

  async getCO2() {
    return (await this.scd4x.getPeriodicMeasurement()).co2
  }

  async getTemperature() {
    return (await this.scd4x.getPeriodicMeasurement()).temperature
  }

  async getHumidity() {
    return (await this.scd4x.getPeriodicMeasurement()).humidity
  }

  async getO2() {
    // O2 だけ SCD4x ではなく独立して取得する
    const o2 = await this.board.i2cReadOnce(I2C_ADDRESS_O2_SENSOR, 0x00, 1, timeout_short).then(data => data[0] / 10)
    console.log('O2CO2Sensor: getO2()', o2)
    this.o2 = o2
    return o2
  }
}

class SCD4x {

  constructor(board) {
    /**
     * Connecting AkaDako board
     * @type {import('./akadako-board').default}
     */
    this.board = board
    this.board.on('disconnect', () => this.reset())
    this.board.on('ready', () => {
      this.serial_number = this.get_serial_number()
      this.start_periodic_measurement()
    })
    this.reset()
  }

  reset() {
    /**
     * シリアルナンバー(48bit)
     * @type {string} serial number (hex string)
     */
    this.serial_number = null
    /**
     * 継続読み取りモードが開始されているかどうか
     */
    this.periodic_measurement_started = false
    /** 継続読み取りモードで最後にデータを取得した時間
     * @type {number} timestamp
     */
    this.periodic_measurement_last_updated = 0
    /**
     * 最後に取得したデータ
     * @type {number} last measurement data
     */
    this.periodic_measurement_last_data = {
      co2: 0,
      temperature: 0,
      humidity: 0,
    }
  }

  /**
   * 継続読み取りモードのデータを取得する
   * @returns {Promise<{co2: number, temperature: number, humidity: number}>} CO2 concentration [ppm], temperature [°C], humidity [%RH]
   */
  async getPeriodicMeasurement() {
    let ondemand = false
    // read_measurement の取得感覚は5秒なので、3秒以内なら新規データ取得は行わない（古いデータを返す）
    if (3000 < Date.now() - this.periodic_measurement_last_updated) {
      // 継続読み取りモードが開始されていなければ開始する
      await this.startPeriodicMesurement()
      // データ取得準備ができるのを待つ
      if (await this.waitDataReady(200, 20)) {
        // データを取得する
        const measurement = await this.read_measurement()
        // データを保存する
        this.periodic_measurement_last_data = measurement
        this.periodic_measurement_last_updated = Date.now()
        ondemand = true
      }
    }
    return {
      ...this.periodic_measurement_last_data,
      timestamp: this.periodic_measurement_last_updated,
      ondemand,
    }
  }

  /**
   * 継続読み取りモードになってなければ開始する
   */
  async startPeriodicMesurement(force = false) {
    if (!this.periodic_measurement_started || force) {
      await this.start_periodic_measurement()
      this.periodic_measurement_started = true
    }
  }

  /**
   * 継続読み取りモードを終了する
   */
  async stopPeriodicMesurement(force = false) {
    if (this.periodic_measurement_started || force) {
      await this.stop_periodic_measurement()
      this.periodic_measurement_started = false
    }
  }

  /**
   * データ取得準備が出来るまで待つ
   * @param {number} timeoutMs 継続取得モードの場合は最大5000かかる
   * @param {number} checkIntervalMs 
   * @returns {Promise<boolean>} true: データ取得準備が出来ている, false: データ取得準備が出来ていない
   */
  async waitDataReady(timeoutMs = 200, checkIntervalMs = 20) {
    const expiryTimeMs = Date.now() + timeoutMs
    while (Date.now() < expiryTimeMs) {
      if (await this.isDataReady()) {
        return true
      }
      await new Promise(resolve => setTimeout(resolve, checkIntervalMs))
    }
    return false
  }

  /**
   * データ取得準備が出来ているかどうかを取得する
   * @returns {Promise<boolean>} true: データ取得準備が出来ている, false: データ取得準備が出来ていない
   */
  async isDataReady() {
    const data_ready_status = await this.get_data_ready_status()
    return data_ready_status != 0
  }

  /*
  3.5 Basic Commands
  This section lists the basic SCD4x commands that are necessary to start a periodic measurement and subsequently read out
  the sensor outputs.
  The typical communication sequence between the I2C master (e.g., a microcontroller) and the SCD4x sensor is as follows:
  1. The sensor is powered up
  2. The I2C master sends a start_periodic_measurement command. Signal update interval is 5 seconds.
  3. The I2C master periodically reads out data with the read measurement sequence.
  4. To put the sensor back to idle mode, the I2C master sends a stop periodic measurement command.
  While a periodic measurement is running, no other commands must be issued with the exception of read_measurement,
  get_data_ready_status, stop_periodic_measurement and set_ambient_pressure.

  3.5 基本コマンド
  このセクションでは、定期的な測定を開始し、その後センサー出力を読み出すために必要な基本的なSCD4xコマンドを示します。
  I2Cマスター（例えばマイクロコントローラー）とSCD4xセンサーの間の典型的な通信シーケンスは次のとおりです。
  
  1. センサーが起動します。
  2. I2Cマスターはstart_periodic_measurementコマンドを送信します。信号更新間隔は5秒です。
  3. I2Cマスターは定期的にread measurementシーケンスでデータを読み出します。
  4. センサーをアイドルモードに戻すには、I2Cマスターはstop_periodic_measurementコマンドを送信します。
  
  定期的な測定が実行されている間は以下4つのコマンド以外は発行してはいけません。
  - read_measurement
  - get_data_ready_status
  - stop_periodic_measurement
  - set_ambient_pressure
  */

  /**
   * 3.5.1 start_periodic_measurement
   * start periodic measurement, signal update interval is 5 seconds.
   */
  async start_periodic_measurement() {
    // Send the 'start_periodic_measurement' command
    await this.board.i2cWrite(I2C_ADDRESS_SCD4x, 0x21, 0xb1)
    console.log('SCD4x: start_periodic_measurement')
  }

  /**
   * 3.5.2 read_measurement
   * read sensor output. The measurement data can only be read out once per signal update interval as the buffer is
   * emptied upon read-out. If no data is available in the buffer, the sensor returns a NACK. To avoid a NACK response, the
   * get_data_ready_status can be issued to check data status (see chapter 3.8.2 for further details). The I2C master can abort the
   * read transfer with a NACK followed by a STOP condition after any data byte if the user is not interested in subsequent data.
   * 
   * センサー出力を読み出します。バッファは読み出し時に空になるため、信号更新間隔ごとに測定データを1回しか読み出すことはできません。
   * バッファにデータがない場合、センサーはNACKを返します。NACK応答を回避するには、データステータスを確認するために get_data_ready_status を発行できます
   * （詳細については、3.8.2章を参照）。ユーザーが後続のデータに興味がない場合、I2CマスターはNACKを送信し、任意のデータバイトの後にSTOP条件で読み取り転送を中止できます。
   */
  async read_measurement() {
    // Send the 'read_measurement' command
    await this.board.i2cWrite(I2C_ADDRESS_SCD4x, 0xec, 0x05)
    // Max. command duration [ms]: 1
    await new Promise(resolve => setTimeout(resolve, 1))
    const data = await this.board.i2cReadOnce(I2C_ADDRESS_SCD4x, 0x00, 9, timeout_short)
    const words = this.parseDataWithCRCValidation(data)
    const co2 = words[0]
    const temperature = -45 + 175 * words[1] / 2
    const humidity = 100 * words[2] / 2
    const measurement = {co2, temperature, humidity }
    console.log('SCD4x: read_measurement', `{ co2: ${co2}, temperature: ${temperature}, humidity: ${humidity} }`, measurement)
    return measurement
  }

  /**
   * 3.5.3 stop_periodic_measurement
   * stop periodic measurement to change the sensor configuration or to save power. Note that the sensor will only
   * respond to other commands after waiting 500 ms after issuing the stop_periodic_measurement command.
   */
  async stop_periodic_measurement() {
    //0x3f86
    // Send the 'stop_periodic_measurement' command
    await this.board.i2cWrite(I2C_ADDRESS_SCD4x, 0x3f, 0x86)
    console.log('SCD4x: stop_periodic_measurement')
    // Max. command duration [ms]: 500
    await new Promise(resolve => setTimeout(resolve, 500))
  }



  /*
    3.6 On-Chip Output Signal Compensation
    The SCD4x features on-chip signal compensation to counteract pressure and temperature effects. Feeding the SCD4x with the
    pressure or altitude enables highest accuracy of the CO2 output signal across a large pressure range. Setting the temperature
    offset improves the accuracy of the relative humidity and temperature output signal. Note that the temperature offset does not
    impact the accuracy of the CO2 output.
    To change or read sensor settings, the SCD4x must be in idle mode. A typical sequence between the I2C master and the SCD4x is described as follows:
    1. If the sensor is operated in a periodic measurement mode, the I2C master sends a stop_periodic_measurement command.
    2. The I2C master sends one or several commands to get or set the sensor settings.
    3. If configurations shall be preserved after power-cycle events, the persist_settings command must be sent (see chapter 3.9.1)
    4. The I2C master sends a start measurement command to set the sensor in the operating mode again.

    3.6 オンチップ出力信号補償
    SCD4xには、圧力と温度の影響を相殺するためのオンチップ信号補償機能が備わっています。
    SCD4xに圧力または高度を供給すると、広い圧力範囲でCO2出力信号の最高精度が得られます。
    温度オフセットを設定すると、相対湿度と温度出力信号の精度が向上します。
    温度オフセットはCO2出力の精度に影響しません。
    センサーの設定を変更または読み出すには、SCD4xをアイドルモードにする必要があります。
    I2CマスターとSCD4xの間の典型的なシーケンスは次のとおりです。
    1. センサーが定期的な測定モードで動作している場合、I2Cマスターはstop_periodic_measurementコマンドを送信します。
    2. I2Cマスターは、センサー設定を取得または設定するために1つ以上のコマンドを送信します。
    3. 電源サイクルイベント後に構成を保持する場合は、persist_settingsコマンドを送信する必要があります（3.9.1章を参照）。
    4. I2Cマスターは、センサーを再び動作モードに設定するために測定開始コマンドを送信します。
  */


  /**
   * 3.6.1 set_temperature_offset
   * The temperature offset has no influence on the SCD4x CO2 accuracy. Setting the temperature offset of the SCD4x
   * inside the customer device correctly allows the user to leverage the RH and T output signal. Note that the temperature offset
   * can depend on various factors such as the SCD4x measurement mode, self-heating of close components, the ambient
   * temperature and air flow. Thus, the SCD4x temperature offset should be determined inside the customer device under its typical
   * operation conditions (including the operation mode to be used in the application) and in thermal equilibrium. Per default, the
   * temperature offset is set to 4° C. To save the setting to the EEPROM, the persist setting (see chapter 3.9.1) command must be
   * issued. Equation (1) shows how the characteristic temperature offset can be obtained. 
   * 
   * ja:
   * 温度オフセットはSCD4x CO2の精度に影響しません。
   * デバイス内のSCD4xの温度オフセットを正しく設定すると、ユーザーはRHおよびT出力信号を活用できます。
   * 温度オフセットは、SCD4xの測定モード、近接部品の自己加熱、周囲温度、空気流など、さまざまな要因に依存する可能性があることに注意してください。
   * したがって、SCD4xの温度オフセットは、典型的な動作条件（アプリケーションで使用する動作モードを含む）および熱平衡下で、
   * 顧客デバイス内で決定する必要があります。デフォルトでは、温度オフセットは4°Cに設定されています。
   * EEPROMに設定を保存するには、persist setting（3.9.1章を参照）コマンドを発行する必要があります。
   * 式（1）は、特性温度オフセットを取得する方法を示しています。
   * 
   * 𝑇𝑜𝑓𝑓𝑠𝑒𝑡_𝑎𝑐𝑡𝑢𝑎𝑙 = 𝑇𝑆𝐶𝐷40 − 𝑇𝑅𝑒𝑓𝑒𝑟𝑒𝑛𝑐𝑒 + 𝑇𝑜𝑓𝑓𝑠𝑒𝑡_ 𝑝𝑟𝑒𝑣𝑖𝑜𝑢𝑠 
   * 
   */
  async set_temperature_offset() {
    if (this.periodic_measurement_started) {
      console.log('SCD4x: WARN: set_temperature_offset() is not available while in periodic measurement started.')
      return
    }
    // Send the 'set_temperature_offset' command
    await this.board.i2cWrite(I2C_ADDRESS_SCD4x, 0x24, 0x1d)
    console.log('SCD4x: set_temperature_offset')
    // Max. command duration [ms]: 1
    await new Promise(resolve => setTimeout(resolve, 1))
  }

  /**
   * 3.9.2 get_serial_number
   * Reading out the serial number can be used to identify the chip and to verify the presence of the sensor.
   * The get serial number command returns 3 words, and every word is followed by an 8-bit CRC checksum. Together, the 3 words
   * constitute a unique serial number with a length of 48 bits (big endian format).
   *
   * 3.9.2 get_serial_number
   * シリアル番号を読み出すことで、チップを識別し、センサーの存在を確認することができます。
   * シリアル番号コマンドは3ワードを返し、各ワードの後に8ビットのCRCチェックサムが続きます。3つのワードは合わせて48ビットの長さのユニークなシリアル番号を構成します（ビッグエンディアン形式）。
   *
   * @returns {Promise<string>} serial number (hex string)
   */
  async get_serial_number() {
    if (this.periodic_measurement_started) {
      console.log('SCD4x: WARN: get_serial_number() is not available while in periodic measurement started.')
      return
    }
    // Send the 'get_serial_number' command
    await this.board.i2cWrite(I2C_ADDRESS_SCD4x, 0x36, 0x82)
    const data = await this.board.i2cReadOnce(I2C_ADDRESS_SCD4x, 0x00, 9, timeout_short)
    const serial_number = [data[0], data[1], data[3], data[4], data[6], data[7]]
    const serial_number_string = serial_number.map(u8 => u8.toString(16).padEnd(2, '0')).join('').toUpperCase()
    console.log('SCD4x: get_serial_number', serial_number_string)
    return serial_number_string
  }

  /**
   * 3.9.3 perform_self_test
   * The perform_self_test feature can be used as an end-of-line test to check sensor functionality and the customer power supply to the sensor. 
   * 0 → self-test passed (no malfunction detected)
   * else → self-test failed (malfunction detected)
   * 
   * @returns {Promise<boolean>} self-test passed (true) or failed (false)
   */
  async perform_self_test() {
    if (this.periodic_measurement_started) {
      console.log('SCD4x: WARN: perform_self_test() is not available while in periodic measurement started.')
      return
    }
    // Send the 'perform_self_test' command
    await this.board.i2cWrite(I2C_ADDRESS_SCD4x, 0x36, 0x84)
    const data = await this.board.i2cReadOnce(I2C_ADDRESS_SCD4x, 0x00, 3, 10000)
    const self_test = (data[0] << 8 | data[1])
    const self_test_passed = self_test == 0
    console.log('SCD4x: perform_self_test', self_test, self_test_passed)
    return self_test_passed
  }

  /**
   * 3.9.4 perfom_factory_reset
   * The perform_factory_reset command resets all configuration settings stored in the EEPROM and erases the FRC and ASC algorithm history. 
   */
  async perfom_factory_reset() {
    if (this.periodic_measurement_started) {
      console.log('SCD4x: WARN: perfom_factory_reset() is not available while in periodic measurement started.')
      return
    }
    // Send the 'perfom_factory_reset' command
    await this.board.i2cWrite(I2C_ADDRESS_SCD4x, 0x36, 0x32)
    console.log('SCD4x: perfom_factory_reset')
    await new Promise(resolve => setTimeout(resolve, 1200))
  }

  /**
   * 3.9.5 reinit
   * The reinit command reinitializes the sensor by reloading user settings from EEPROM. Before sending the reinit command,
   * the stop measurement command must be issued. If the reinit command does not trigger the desired re-initialization,
   * a power-cycle should be applied to the SCD4x
   * @returns 
   */
  async reinit() {
    if (this.periodic_measurement_started) {
      console.log('SCD4x: WARN: reinit() is not available while in periodic measurement started.')
      return
    }
    // Send the 'reinit' command
    await this.board.i2cWrite(I2C_ADDRESS_SCD4x, 0x36, 0x46)
    console.log('SCD4x: reinit')
    await new Promise(resolve => setTimeout(resolve, 20))
  }

  /*
    3.10 Low power single shot (SCD41)
    In addition to periodic measurement modes, the SCD41 features a single shot measurement mode, i.e. allows for on-demand measurements.
    The typical communication sequence is as follows:
    1. The sensor is powered up.
    2. The I2C master sends a single shot command and waits for the indicated max. command duration time.
    3. The I2C master reads out data with the read measurement sequence (chapter 3.5.2).
    4. Steps 2-3 are repeated as required by the application.
    To reduce noise levels, the I2C master can perform several single shot measurements in a row and average the CO2 output
    values. After a power cycle, the initial two single shot readings should be discarded to maximize accuracy. The idle current in
    between measurements is 0.15 mA (typ.), respectively 0.2 mA (max.). The energy consumed per single shot typically is 243 mJ (296 mJ max.).
    As for the periodic measurement modes, the automatic self-calibration (ASC) is enabled per default in single shot operation.
    The automatic self-calibration is optimized for single shot measurements performed every 5 minutes. Longer measurement
    intervals will result in less frequent self-calibration sequences. Note that no self-calibration is issued if the sensor is power-cycled
    between single shot measurements Please consult Chapter 3.7 for a detailed description of the automatic-self calibration and
    the corresponding commands.

    3.10 低消費電力シングルショット（SCD41）
    SCD41には、定期的な測定モードに加えて、シングルショット測定モードが備わっています。つまり、オンデマンド測定が可能です。
    典型的な通信シーケンスは次のとおりです。

    1. センサーが起動します。
    2. I2Cマスターはシングルショットコマンドを送信し、指定された最大コマンド期間時間を待ちます。
    3. I2Cマスターは、測定データを読み出します（3.5.2章を参照）。
    4. 必要に応じて、ステップ2-3を繰り返します。

    ノイズレベルを低減するために、I2Cマスターは複数のシングルショット測定を連続して実行し、CO2出力値を平均化できます。
    電源サイクル後、初期の2つのシングルショット読み出しは破棄する必要があります。測定間のアイドル電流は0.15 mA（typ。）0.2 mA（max。）です。
    シングルショットあたりの消費エネルギーは、通常243 mJ（最大296 mJ）です。
    定期的な測定モードと同様に、シングルショット動作では、自動自己キャリブレーション（ASC）がデフォルトで有効になっています。
    自動自己キャリブレーションは通常5分ごとに実行されるシングルショット測定に最適化されています。
    測定間隔が長いと自己キャリブレーションシーケンスがより頻繁に発生します。
    シングルショット測定間にセンサーの電源が切断された場合はセルフキャリブレーションは発行されません。
    自動自己キャリブレーションと対応するコマンドの詳細な説明については第3.7章を参照してください。
  */

  /** 
   * 3.10.1 measure_single_shot 
   * On-demand measurement of CO2 concentration, relative humidity and temperature. The sensor output is read using the read_measurement command (chapter 3.5.2).
   * 二酸化炭素濃度、相対湿度、温度のオンデマンド測定。センサー出力は、read_measurementコマンド（3.5.2章）を使用して読み出されます。
   */
  async measure_single_shot() {
    if (this.periodic_measurement_started) {
      console.log('SCD4x: WARN: measure_single_shot() is not available while in periodic measurement started.')
      return
    }
    // Send the 'measure_single_shot' command
    await this.board.i2cWrite(I2C_ADDRESS_SCD4x, 0x21, 0x9d)
    console.log('measure_single_shot')
    // Max command duration [ms]: 5000
    await new Promise(resolve => setTimeout(resolve, 5000))
  }

  /**
   * 3.10.2 measure_single_shot_rht_only
   * On-demand measurement of relative humidity and temperature only. The sensor output is read using the read_measurement command (chapter 3.5.2). CO2 output is returned as 0 ppm.
   * 相対湿度と温度のオンデマンド測定のみ。センサー出力は、read_measurementコマンド（3.5.2章）を使用して読み出されます。CO2出力は0 ppmとして返されます。
   */
  async measure_single_shot_rht_only() {
    if (this.periodic_measurement_started) {
      console.log('SCD4x: WARN: measure_single_shot_rht_only() is not available while in periodic measurement started.')
      return
    }
    // Send the 'measure_single_shot_rht_only' command
    await this.board.i2cWrite(I2C_ADDRESS_SCD4x, 0x21, 0x96)
    console.log('measure_single_shot_rht_only')
    // Max command duration [ms]: 50
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  async get_temperature_offset() {
    if (this.periodic_measurement_started) {
      console.log('SCD4x: WARN: get_temperature_offset() is not available while in periodic measurement started.')
      return
    }
    // Send the 'get_temperature_offset' command
    await this.board.i2cWrite(I2C_ADDRESS_SCD4x, 0x23, 0x18)
    const data = await this.board.i2cReadOnce(I2C_ADDRESS_SCD4x, 0x00, 3, timeout_short)
    const temperature_offset_celsius = 175 * (data[0] << 8 | data[1]) / 65536
    console.log('get_temperature_offset', temperature_offset_celsius)
    return temperature_offset_celsius
  }

  async get_sensor_altitude() {
    if (this.periodic_measurement_started) {
      console.log('SCD4x: WARN: get_sensor_altitude() is not available while in periodic measurement started.')
      return
    }
    // Send the 'get_sensor_altitude' command
    await this.board.i2cWrite(I2C_ADDRESS_SCD4x, 0x23, 0x22)
    const data = await this.board.i2cReadOnce(I2C_ADDRESS_SCD4x, 0x00, 3, timeout_short)
    const sensor_altitude = (data[0] << 8 | data[1])
    console.log('get_sensor_altitude', sensor_altitude)
    return sensor_altitude
  }

  async get_automatic_self_calibration_enabled() {
    if (this.periodic_measurement_started) {
      console.log('SCD4x: WARN: get_automatic_self_calibration_enabled() is not available while in periodic measurement started.')
      return
    }
    // Send the 'get_automatic_self_calibration_enabled' command
    await this.board.i2cWrite(I2C_ADDRESS_SCD4x, 0x23, 0x13)
    const data = await this.board.i2cReadOnce(I2C_ADDRESS_SCD4x, 0x00, 3, timeout_short)
    const automatic_self_calibration_enabled = (data[0] << 8 | data[1]) == 1
    console.log('get_automatic_self_calibration_enabled', automatic_self_calibration_enabled, automatic_self_calibration_enabled == 1)
    return automatic_self_calibration_enabled == 1
  }

  // 3.8 Low Power operation
  // To enable use-cases with a constrained power-budget, the SCD4x features a low power periodic measurement mode with signal
  // update interval of approximately 30 seconds. While the low power mode saves power and reduces self-heating of the sensor,
  // the low power periodic measurement mode has a longer response time.
  // The low power periodic measurement mode is initiated and read-out in a similar manner as the default periodic measurement.
  // Please consult chapter 3.5.2 for further instructions. To avoid receiving a NACK in case the result of a subsequent measurement
  // is not ready yet, the get_data_ready_status command can be used to check whether new measurement data is available for
  // read-out.
  //
  // 3.8 低消費電力動作
  // 電力予算の制約のあるユースケースを有効にするために、SCD4xには約30秒の信号更新間隔を持つ低消費電力周期測定モードが備わっています。
  // 低消費電力モードは電力を節約し、センサーの自己加熱を低減しますが、低消費電力周期測定モードは応答時間が長くなります。
  // 低消費電力周期測定モードは、デフォルトの周期測定と同様に初期化され、読み出されます。
  // 詳しい手順については、3.5.2章を参照してください。後続の測定結果がまだ準備できていない場合にNACKを受信しないようにするために、
  // get_data_ready_statusコマンドを使用して、新しい測定データが読み出し可能かどうかを確認できます。

  /**
   * 3.8.1 start_low_power_periodic_measurement
   * start low power periodic measurement, signal update interval is approximately 30 seconds
   * 
   * 低消費電力周期測定を開始します。信号更新間隔は約30秒です。
   */
  async start_low_power_periodic_measurement() {
    if (this.periodic_measurement_started) {
      console.log('SCD4x: WARN: start_low_power_periodic_measurement() is not available while in periodic measurement started.')
      return
    }
    // Send the 'start_low_power_periodic_measurement' command
    await this.board.i2cWrite(I2C_ADDRESS_SCD4x, 0x21, 0xac)
  }

  /**
   * 3.8.2 get_data_ready_status
   * @returns {Promise<boolean>} data ready status (0 -> data not ready, else -> data ready for read-out)
   */
  async get_data_ready_status() {
    // Send the 'get_data_ready_status' command
    await this.board.i2cWrite(I2C_ADDRESS_SCD4x, 0xe4, 0xb8)
    // Max. command duration [ms]: 1
    await new Promise(resolve => setTimeout(resolve, 1))
    const data = await this.board.i2cReadOnce(I2C_ADDRESS_SCD4x, 0x00, 3, timeout_short)
    const words = this.parseDataWithCRCValidation(data)
    console.log('get_data_ready_status', words, data)
    const data_ready_status = words[0] & 0x07ff //下位11bitを取り出す
    console.log('get_data_ready_status', data_ready_status, data_ready_status == 0)
    return data_ready_status
  }

  /**
   * 2バイト毎にCRCが付いたデータをパースする
   * @param {number[]} data uint8 array
   * @returns {number[]} uint16 array
   */
  parseDataWithCRCValidation(data) {
    const words = []
    for (let i = 0; i < data.length; i += 3) {
      const word = data[i] << 8 | data[i + 1]
      const crc = data[i + 2]
      if (crc != this.sensirion_common_generate_crc([data[i], data[i + 1]], 2)) {
        console.log('crc error', i, word, crc)
      }
      words.push(word)
    }
    return words
  }

  /**
   * 3.11 Checksum Calculation
   * The 8-bit CRC checksum transmitted after each data word is generated by a CRC algorithm. Its properties are displayed in
   * Table 30. The CRC covers the contents of the two previously transmitted data bytes. To calculate the checksum only these two
   * previously transmitted data bytes are used. Note that command words are not followed by CRC.
   */
  sensirion_common_generate_crc(data, count) {
    const CRC8_POLYNOMIAL = 0x31
    const CRC8_INIT = 0xFF
    let crc = CRC8_INIT
    let crc_bit
    // calculates 8-Bit checksum with given polynomial
    for (let current_byte = 0; current_byte < count; ++current_byte) {
      crc ^= (data[current_byte])

      for (crc_bit = 8; crc_bit > 0; --crc_bit) {
        if (crc & 0x80)
          crc = (crc << 1) ^ CRC8_POLYNOMIAL
        else
          crc = (crc << 1)
        // JavaScript bitwise operations use 32-bit signed integers, so we need
        // to ensure that the high bits are zeroed out and the result is a uint8
        crc &= 0xFF
      }
    }
    return crc
  }

}


