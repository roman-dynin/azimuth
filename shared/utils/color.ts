export const getRandomColorValue = () => Math.floor(Math.random() * 254)

export const getRandomColor = () => `rgba(${getRandomColorValue()}, ${getRandomColorValue()}, ${getRandomColorValue()}, 0.75)`
