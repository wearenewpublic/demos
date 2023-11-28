import { useEffect } from "react";
import { Platform, Vibration, View } from "react-native";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
    }

class VibrationPlayer {

    constructor(){
        this.config = {
            pattern: [0,1000],
            delay: 0
        }
        this.playing = false;
        this.paused = false;
        this.speed = 1;
        this.multiplier = 1; // Make a pattern longer or shorter
        this.currentComponent = undefined; // Assign a component to continue playing their vibration
        this.setPlayerStatus = ()=>{};
    }

    async Play(repeat = false, id = undefined, onFinishCallback = ()=>{}){

        this.playing = true
        this.paused = false;
        this.currentComponent = id;

        this.speed = 1;


        let pattern = this.config.pattern;
        const completeDuration = pattern.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

        while(this.playing && this.currentComponent == id){

            if(this.paused){
                await sleep(50);
                continue;
            }


            let transformedPattern = pattern.map( e => e*this.multiplier);
            if(Platform.OS === "android" || Platform.OS === "ios"){
                // Native expects a [pause, buzz, pause, buzz,...] pattern
                // Web expects a [buzz, pause, buzz, pause,...] pattern
                transformedPattern = [0,...transformedPattern]
            }
            await sleep(this.config.delay * this.speed);
            this.setPlayerStatus(true)
            Vibration.vibrate(transformedPattern)
            await sleep(completeDuration);
            this.setPlayerStatus(false)
            if(!repeat){
                this.playing = false
                break;
            }
        }

        onFinishCallback();
    }

    Stop(){
        this.playing = false
        this.setPlayerStatus(false)
        this.paused = false
        this.currentComponent = undefined
        Vibration.cancel();
    }

    SetConfig(config, id = undefined){
        if(this.currentComponent !== id) {
            this.speed = 1
            this.multiplier = 1;
        }
        this.config = config
    }

    Pause(){
        this.paused = true;
        this.setPlayerStatus(false)
    }

    Resume(){
        this.paused = false;
        this.setPlayerStatus(true)
    }

}

// global static vibration player instance
export const Vibrator = new VibrationPlayer()

export function VibrationPlayerComponent({config, loop = false}) {

    useEffect(() => {
        Vibrator.SetConfig(config)
        Vibrator.Play(loop)

        return () => {
            Vibrator.Stop()
        };
    });

    return <View></View>
}