import { useCallback, useState } from 'react';

const LOCATION_PRIMED_KEY = 'rimay_location_primed';

/**
 * El permiso nativo de geolocalización pedido "en frío" (sin explicar antes
 * para qué sirve) tiene tasas de aceptación mucho peores. Este flag persiste
 * por dispositivo para no volver a mostrar el explicador una vez aceptado.
 */
export function useLocationPriming() {
  const [primed, setPrimed] = useState(() => localStorage.getItem(LOCATION_PRIMED_KEY) === '1');

  const markPrimed = useCallback(() => {
    localStorage.setItem(LOCATION_PRIMED_KEY, '1');
    setPrimed(true);
  }, []);

  return { primed, markPrimed };
}
