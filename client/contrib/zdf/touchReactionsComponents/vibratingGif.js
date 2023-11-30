import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { useEffect, useId, useState } from "react";
import { Vibrator } from "./vibrationPlayer";

export function VibratingGif({config}){


    const [playing, setPlaying] = useState(false)
    const [loop, setLoop] = useState(false)
    const id = useId();

    const toggleGif = () => {
        setPlaying(!playing);
        if(!playing){
            setLoop(true)
            Vibrator.SetConfig(config)
            Vibrator.Play(false, id, ()=>{
                setPlaying(false)
            })
        } else {
            Vibrator.Stop()
            setPlaying(false)
            setLoop(false)
        }
    }

    useEffect(() => {
        if(playing && Vibrator.currentComponent != id){
            setPlaying(false);
            setLoop(false)
        }

        if(!playing && loop && Vibrator.currentComponent == id){
            setPlaying(true)
            setLoop(true)
            Vibrator.SetConfig(config)
            Vibrator.Play(false, id, ()=>{
                setPlaying(false)
            })
        }
    })

    useEffect(() => {

        return () => {
            Vibrator.SetConfig(config)
            Vibrator.Stop()
        }
    }, [])

    return <TouchableOpacity style={style.container} onPress={() => toggleGif()}>
        {playing ? 
            <View>
                <Image style={style.gif} source={config.source}></Image>
            </View>
            : <Image style={style.gif} source={config.stillImage}></Image>
        }
    </TouchableOpacity>

}

const style = StyleSheet.create({
    container: {
        height: 100,
        width: 100
    },
    gif: {
        width:100,
        height:100
    }
});