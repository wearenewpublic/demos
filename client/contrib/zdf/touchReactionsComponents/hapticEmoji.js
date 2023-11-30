import React from "react";
import { VibratingGif } from "./vibratingGif";
import { vibratingEmojis } from "./vibratingEmojiConfig";


export function HapticEmojiScreen({navigation, route}) {
    const emojiConfig = vibratingEmojis[route.params.emoji];

    return <VibratingGif config={emojiConfig}></VibratingGif>;
}