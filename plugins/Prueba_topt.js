import rangosTeibol from './rangos-teibol.js';

const obtenerTopTeibol = (usersData, cantidad = 10) => {
    // Procesar datos de usuarios
    const usuarios = Object.entries(usersData)
        .filter(([_, user]) => user.yenes > 0)
        .map(([jid, user]) => {
            const rango = Object.keys(rangosTeibol)
                .reverse()
                .find(r => user.yenes >= rangosTeibol[r].requerido) || 0;
            
            return {
                jid,
                yenes: user.yenes,
                rango: parseInt(rango),
                nombreRango: rangosTeibol[rango].nombre
            };
        });
    
    // Ordenar por yenes (descendente)
    const topOrdenado = usuarios.sort((a, b) => b.yenes - a.yenes);
    
    // Limitar a la cantidad solicitada
    return topOrdenado.slice(0, cantidad);
};

export { obtenerTopTeibol };
