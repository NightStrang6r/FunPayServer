import { getAllGoods } from './goods.js';
import goodsState from '../data/goodsState.js';
import { log } from './log.js';

function checkActivity(userId) {
    try {
        const goodsNow = getAllGoods(userId);
        const goodsBackup = goodsState.goods;

        for(let i = 0; i < goodsNow.length; i++) {
            for(let j = 0; j < goodsBackup.length; j++) {
                if(goodsNow[i].offer_id == goodsBackup[j].offer_id) {
                    if(goodsNow[i].active != goodsBackup[j].active) {
                        log(`Найдено расхождение: ${goodsNow[i].offer_id} ${goodsNow[i].active}`);
                    }
                }
            }
        }
    } catch (err) {
        log(`Ошибка при проверке активности лотов: ${err}`);
    }
}

export { checkActivity };