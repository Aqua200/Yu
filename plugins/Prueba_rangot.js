// Sistema de rangos equilibrado (no demasiado extenso)
const rangosTeibol = {
    0: { 
        nombre: "Mesera Novata", 
        requerido: 0, 
        pago: [100, 300], 
        clientes: 1,
        color: "#CCCCCC"
    },
    1: { 
        nombre: "Bailarina Bronce", 
        requerido: 10000, 
        pago: [300, 600], 
        clientes: 2,
        color: "#CD7F32"
    },
    2: { 
        nombre: "Bailarina Plata", 
        requerido: 30000, 
        pago: [500, 900], 
        clientes: 2,
        color: "#C0C0C0"
    },
    3: { 
        nombre: "Showgirl Oro", 
        requerido: 70000, 
        pago: [800, 1500], 
        clientes: 3,
        color: "#FFD700"
    },
    4: { 
        nombre: "Diosa Platino", 
        requerido: 150000, 
        pago: [1200, 2500], 
        clientes: 4,
        color: "#E5E4E2"
    },
    5: { 
        nombre: "Reina Diamante", 
        requerido: 300000, 
        pago: [2000, 4000], 
        clientes: 5,
        color: "#B9F2FF"
    }
};

export default rangosTeibol;
