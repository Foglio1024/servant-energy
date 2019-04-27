class ServantEnergy
{
    constructor(mod)
    {
        this.mod = mod;
        this.isGathering = false;
        this.installHooks(mod);
    }
    installHooks(mod)
    {
        this.mod.hook('S_COLLECTION_PICKSTART', 2, e =>
        {
            if (e.user != this.myServant) return true;
            this.startGather(e.duration);
            return false;
        });
        this.mod.hook('S_COLLECTION_PICKEND', 2, e =>
        {
            if (e.user != this.myServant) return true;
            this.endGather();
            return false;
        });
        this.mod.hook('S_SPAWN_SERVANT', 2, e =>
        {
            if (!mod.game.me.is(e.owner)) return;
            this.myServant = e.gameId;
            this.currServantEnergy = e.energy;
            this.mod.setTimeout(() => this.changeEnergy(), 1000);
        });
        this.mod.hook('S_CHANGE_SERVANT_ENERGY', 1, e =>
        {
            if (e.id != this.myServant) return;
            this.currServantEnergy = e.energy;
            this.changeEnergy();
        });
    }
    endGather()
    {
        this.isGathering = false;
        this.mod.clearInterval(this.gatherInterval);
        this.changeEnergy();
    }
    startGather(duration)
    {
        let currVal = 0;
        let interval = 100;
        let time = new Date().getTime();
        this.isGathering = true;
        this.gatherInterval = this.mod.setInterval(() =>
        {
            if (!this.isGathering) return;
            let now = new Date().getTime();
            let diff = now - time;
            if(diff < 0) diff = 0;
            currVal = Number(currVal) + diff > duration ? duration : Number(currVal) + diff;
            time = now;
            this.mod.send('S_SHOW_HP', 3, {
                gameId: this.myServant,
                curHp: currVal,
                maxHp: duration,
                enemy: true,
                edgeD: 0,
                edgeF: 0,
                edgeDuration: 0,
                unk: 0
            });
        }, interval);

    }

    changeEnergy()
    {
        if (this.isGathering) return;
        this.mod.send('S_SHOW_HP', 3, {
            gameId: this.myServant,
            curHp: this.currServantEnergy,
            maxHp: 100,
            enemy: false,
            edgeD: 0,
            edgeF: 0,
            edgeDuration: 0,
            unk: 0
        });
    }
}

module.exports = ServantEnergy;