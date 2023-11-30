// Haptic emojis taken from https://googlefonts.github.io/noto-emoji-animation/
export const vibratingEmojis = {
    "heart": {
        source: require("./assets/heart.gif"),
        pattern: [20,30,50,400,100,450],
        stillImage: require("./assets/heart.png"),
        delay: 750,
        duration: 1800,
        random: true},
    "fire": {source: require("./assets/fire.gif"),
        pattern: [50, 80, 60, 70, 40, 90, 70, 50, 80, 60, 70, 40, 90, 70, 50, 80, 60, 70, 40, 90],
        stillImage: require("./assets/fire.png"),
        delay: 0,
        duration: 990,
        random: false
    },
    "clap": {
        source: require("./assets/clap.gif"),
        pattern: [20,30,50,100],
        stillImage: require("./assets/clap.png"),
        delay: 100,
        duration: 200,
        random: true
    },
    "thumbsup": {
        source: require("./assets/thumbsup.gif"),
        pattern: [50,100,100,720],
        stillImage: require("./assets/thumbsup.png"),
        delay: 1400,
        duration: 2370,
        random: true
    },
    "foldedhands": {
        source: require("./assets/foldedhands.gif"),
        pattern: [30,20,50,20,30,250],
        stillImage: require("./assets/foldedhands.png"),
        delay: 950,
        duration: 1350,
        random: true
    },
}