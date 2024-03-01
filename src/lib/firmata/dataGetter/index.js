import EnvSensorGetter from './envSensor'
import AccelerationGetter from './acceleration'
import DistanceGetter from './distance'
import WaterTempertureGetter from './waterTemperture'
import InputGetter from './input'

import LTR303 from '../ltr303'
import O2CO2Sensor from '../o2co2'

export default class DataGetter {
  constructor(board) {
    this.board = board

    if (this.board) {
      this.ltr303 = new LTR303(this.board)
      this.envSensorGetter = new EnvSensorGetter(this.board)
      this.accelerationGetter = new AccelerationGetter(this.board)
      this.distanceGetter = new DistanceGetter(this.board)
      this.waterTempertureGetter = new WaterTempertureGetter(this.board)
      this.inputGetter = new InputGetter(this.board)
      this.o2co2 = new O2CO2Sensor(this.board)
    }
  }

  async getData (kind) {
    try {
      if (kind === '明るさ[lx]') {
        return await this.ltr303.getBrightness()
      } else if (kind === '気温[℃]') {
        return await this.envSensorGetter.getEvnTemperature()
      } else if (kind == '気圧[hPa]') {
        return await this.envSensorGetter.getEnvPressure()
      } else if (kind === '湿度[%]') {
        return await this.envSensorGetter.getEnvHumidity()
      } else if (kind === '加速度(絶対値)[m/s^2]') {
        return await this.accelerationGetter.getAccelerationAbsolute()
      } else if (kind === '加速度(X)[m/s^2]') {
        return await this.accelerationGetter.getAccelerationX()
      } else if (kind === '加速度(Y)[m/s^2]') {
        return await this.accelerationGetter.getAccelerationY()
      } else if (kind === '加速度(Z)[m/s^2]') {
        return await this.accelerationGetter.getAccelerationZ()
      } else if (kind === '加速度(ロール)[°]') {
        return await this.accelerationGetter.getRoll()
      } else if (kind === '加速度(ピッチ)[°]') {
        return await this.accelerationGetter.getPitch()
      } else if (kind === '距離(レーザー)[cm]') {
        return await this.distanceGetter.measureDistanceWithLight()
      } else if (kind === '距離(超音波A)[cm]') {
        return await this.distanceGetter.measureDistanceWithUltrasonicA()
      } else if (kind === '距離(超音波B)[cm]') {
        return await this.distanceGetter.measureDistanceWithUltrasonicB()
      } else if (kind === '水温(デジタルA1)[℃]') {
        return await this.waterTempertureGetter.getWaterTemperatureA()
      } else if (kind === '水温(デジタルB1)[℃]') {
        return await this.waterTempertureGetter.getWaterTemperatureB()
      } else if (kind === '二酸化炭素濃度[ppm]') {
        return await this.o2co2.getCO2()
      } else if (kind === '酸素濃度[%]') {
        return await this.o2co2.getO2()
      } else if (kind === 'アナログA1') {
        return this.inputGetter.analogLevelA1()
      } else if (kind === 'アナログA2') {
        return this.inputGetter.analogLevelA2()
      } else if (kind === 'アナログB1') {
        return this.inputGetter.analogLevelB1()
      } else if (kind === 'アナログB2') {
        return this.inputGetter.analogLevelB2()
      } else if (kind === 'デジタルA1') {
        return this.inputGetter.digitalLevelA1()
      } else if (kind === 'デジタルA2') {
        return this.inputGetter.digitalLevelA2()
      } else if (kind === 'デジタルB1') {
        return this.inputGetter.digitalLevelB1()
      } else if (kind === 'デジタルB2') {
        return this.inputGetter.digitalLevelB2()
      }

      return null
    } catch (e) {
      console.error(e)
      return null
    }
  }
}
