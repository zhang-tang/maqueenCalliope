


//% weight=100 color=#9999FF icon="\uf136" block=Maqueen
namespace maqueenCalliope {

    export enum DistanceUnit {
        //% blockId=maqueenCalliope_DistanceUnitCentimeters block="cm"
        Centimeters,
    }

    export enum Servos {
        //% blockId="maqueenCalliope_ServoS1" block="S1"
        S1 = 0,
        //% blockId="maqueenCalliope_ServoS2" block="S2"
        S2 = 1
    }

    export enum Motors {
        //% blockId="maqueenCalliope_MotorLeft" block="left"
        M1 = 0,
        //% blockId="maqueenCalliope_MotorRight" block="right"
        M2 = 1,
        //% blockId="maqueenCalliope_MotorAll" block="all"
        All = 2
    }

    export enum Dir {
        //% blockId="maqueenCalliope_DirCW" block="Forward"
        CW = 0,
        //% blockId="maqueenCalliope_DirCCW" block="Backward"
        CCW = 1
    }

    export enum Led {
        //% blockId="maqueenCalliope_LedLeft" block="left"
        LedLeft = 0,
        //% blockId="maqueenCalliope_LedRight" block="right"
        LedRight = 1,
        //% blockId="maqueenCalliope_LedAll" block="all"
        LedAll = 2
    }

    export enum LedSwitch {
        //% blockId="maqueenCalliope_LedOn" block="ON"
        LedOn = 1,
        //% blockId="maqueenCalliope_LedOff" block="OFF"
        LedOff = 0
    }

    export enum Patrol {
        //% blockId="maqueenCalliope_PatrolLeft" block="left"
        PatrolLeft = 0,
        //% blockId="maqueenCalliope_PatrolRight" block="right"
        PatrolRight = 1
    }

    export enum Voltage {
        //% blockId="maqueenCalliope_High" block="high"
        High = 1,
        //% blockId="maqueenCalliope_Low"block="low"
        Low = 0
    }

    
    const IICADRRESS = 0x10;

    let irFlag = 0;
    let ltFlag = 0;
    let ltStatus = 0;

    let irCallback: (message: number) => void = null;
    let ltCallback: Action = null;


    /**
     * Read ultrasonic sensor.
     */

    //% weight=95
    //% blockId=maqueenCalliope_ultrasonic block="read ultrasonic sensor |%unit "
    export function ultrasonic(unit: DistanceUnit, maxCmDistance = 500): number {
        let integer = readData(0x29, 1)[0];
        let decimal = readData(0x28, 1)[0];
        return parseFloat(integer+"."+decimal);
    }

    /**
     * Set the Maqueen servos.
     */

    //% weight=90
    //% blockId=maqueenCalliope_servoRun block="servo|%index|angle|%angle"
    //% angle.shadow="protractorPicker"
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    export function servoRun(index: Servos, angle: number): void {
        if (index == Servos.S1) {
            writeData([0x14, angle]);
        } else if (index == Servos.S2) {
            writeData([0x15, angle]);
        } else {
            writeData([0x14, angle]);
            writeData([0x15, angle]);
        }
    }

    /**
     * Set the direction and speed of Maqueen motor.
     */

    //% weight=85
    //% blockId=maqueenCalliope_motorRun block="motor|%index|move|%direction|at speed|%speed"
    //% speed.min=0 speed.max=255 speed.defl=200
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    //% direction.fieldEditor="gridpicker" direction.fieldOptions.columns=2
    export function motorRun(index: Motors, direction: Dir, speed: number): void {
        if (index == Motors.M1){
            writeData([0x00, direction, speed]);
        } else if (index == Motors.M2) {
            writeData([0x02, direction, speed]);
        } else {
            writeData([0x00, direction, speed]);
            writeData([0x02, direction, speed]);
        }
    }

    /**
     * Stop the Maqueen motor.
     */

    //% weight=80
    //% blockId=maqueenCalliope_motorStop block="motor |%motors stop"
    //% motors.fieldEditor="gridpicker" motors.fieldOptions.columns=2 
    export function motorStop(index: Motors): void {
        if (index == Motors.M1) {
            writeData([0x00, 0, 0]);
        } else if (index == Motors.M2) {
            writeData([0x02, 0, 0]);
        } else {
            writeData([0x00, 0, 0]);
            writeData([0x02, 0, 0]);
        }
    }

    /**
     * Turn on/off the LEDs.
     */

    //% weight=75
    //% blockId=maqueenCalliope_writeLED block="LEDlight |%led turn |%ledswitch"
    //% led.fieldEditor="gridpicker" led.fieldOptions.columns=2 
    //% ledswitch.fieldEditor="gridpicker" ledswitch.fieldOptions.columns=2
    export function writeLED(led: Led, ledswitch: LedSwitch): void {
        if (led == Led.LedLeft) {
            writeData([0x0B, ledswitch]);
        } else if (led == Led.LedRight) {
            writeData([0x0C, ledswitch]);
        } else {
            writeData([0x0B, ledswitch]);
            writeData([0x0C, ledswitch]);
        }
    }

    //% weight=74
    //% blockId=maqueenCalliope_setColor block="RGBlight |%color"
    //% color.shadow="colorNumberPicker"
    export function setColor(color: number): void {
        writeData([0x18, (color >> 16) & 0xff ]);
        writeData([0x19, (color >> 8) & 0xff]);
        writeData([0x1A, color & 0xff]);
    }

    //% weight=73
    //% blockId=maqueenCalliope_setRgb block="red |%red green |%green blue |%blue"
    //% red.min=0 red.max=255 red.defl=200
    //% green.min=0 green.max=255 green.defl=200
    //% blue.min=0 blue.max=255 blue.defl=200
    //% advanced=true
    export function setRgb(red: number, green: number, blue: number): number {
        return (red << 16) + (green << 8) + (blue);
    }

    /**
     * Read line tracking sensor.
     */

    //% weight=70
    //% blockId=maqueenCalliope_readPatrol block="the status of |%patrol line tracking sensor"
    //% patrol.fieldEditor="gridpicker" patrol.fieldOptions.columns=2 
    export function readPatrol(patrol: Patrol): number {
        let data = readData(0x1D, 1)[0];
        if (patrol == Patrol.PatrolLeft) {
            return (data & 0x01) === 0 ? 0 : 1;
        } else if (patrol == Patrol.PatrolRight) {
            return (data & 0x02) === 0 ? 0 : 1;
        } else {
            return data;
        }
    }

    /**
     * Read the version number.
     */

    //% weight=65
    //% blockId=maqueenCalliope_getVersion block="get product information"
    export function getVersion(): string {
        let dataLen = readData(0x32, 1)[0];
        let buf = readData(0x33, dataLen);
        let version = "";
        for (let index = 0; index < dataLen; index++) {
            version += String.fromCharCode(buf[index])
        }
        return version;
    }

    /**
     * Line tracking sensor event function
     */

    //% weight=60
    //% blockId=maqueenCalliope_ltEvent block="on|%value line tracking sensor|%vi"
    //% advanced=true
    //% deprecated=true
    export function ltEvent(value: Patrol, vi: Voltage, ltcb: Action) {
        ltFlag = 1;
        ltCallback = ltcb;
        if (value == Patrol.PatrolLeft){
            if (vi == Voltage.High) {
                ltStatus = 0x11;
            } else {
                ltStatus = 0x12;
            }
        } else {
            if (vi == Voltage.High) {
                ltStatus = 0x13;
            } else {
                ltStatus = 0x14;
            }
        } 
    }

    /**
     * Get the value of the infrared sensor
     */

    //% weight=55
    //% blockId=maqueenCalliope_irRead block="read IR key value"
    export function irRead(): number {
        let buf = readData(0x2B, 4);
        let data = buf[3] | (buf[2] << 8) | (buf[1] << 16) | (buf[0] << 24);
        return data;
    }

    /**
     * Infrared sensor event function
     */

    //% weight=50
    //% blockId=maqueenCalliope_irEvent block="on IR received"
    //% draggableParameters
    //% advanced=true
    export function irEvent(ircb: (message: number) => void) {
        irFlag = 1;
        irCallback = ircb;
    }

    function readData(reg: number, len: number): Buffer{
        pins.i2cWriteNumber(IICADRRESS, reg, NumberFormat.UInt8BE);
        return pins.i2cReadBuffer(IICADRRESS, len, false);
    }

    function writeData(buf: number[]): void {
        pins.i2cWriteBuffer(IICADRRESS, pins.createBufferFromArray(buf));
    }

    basic.forever(() => {
        if (irFlag == 1) {
            let buf = readData(0x2B, 4);
            let data = buf[3] | (buf[2] << 8) | (buf[1] << 16) | (buf[0] << 24);
            if (data != 0){
                irCallback(data);
            }
        }
        if (ltFlag == 1) {
            let data = readData(0x1D, 1)[0];
            switch(ltStatus) {
                case 0x11: if(data & 0x01) { ltCallback();break }
                case 0x12: if(!(data & 0x01)) { ltCallback(); break }
                case 0x13: if (data & 0x02) { ltCallback(); break }
                case 0x14: if (!(data & 0x02)) { ltCallback(); break }
            }
        }
        basic.pause(100);
    })
}