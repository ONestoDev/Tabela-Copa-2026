(function () {
  function bindTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(item => item.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
      });
    });
  }

  function bindTheme({state, applyTheme, save}) {
    document.querySelectorAll('[data-theme-option]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.theme = btn.dataset.themeOption;
        applyTheme();
        save();
      });
    });
  }

  function bindJsonActions({state, restore, resetState, save, render}) {
    document.getElementById('exportBtn').onclick = () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], {type:'application/json'});
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'copa2026-dados.json';
      link.click();
    };

    document.getElementById('importBtn').onclick = () => document.getElementById('fileIn').click();
    document.getElementById('fileIn').onchange = async event => {
      const file = event.target.files[0];
      if(!file) return;
      const text = await file.text();
      restore(JSON.parse(text));
    };

    document.getElementById('resetBtn').onclick = () => {
      if(confirm('Tem certeza que quer limpar todos os dados?')) {
        resetState();
        save({replaceRemote:true});
        render();
      }
    };
  }

  function bindSyncAction({syncNow}) {
    const button = document.getElementById('syncNowBtn');
    if(button && syncNow) button.addEventListener('click', syncNow);
  }

  async function loadSavedState({load, restore}) {
    try{
      const saved = await load();
      if(saved && typeof saved === 'object') restore(saved, false);
    }catch(error){}
  }

  async function init(options) {
    bindTabs();
    bindTheme(options);
    bindJsonActions(options);
    bindSyncAction(options);
    await loadSavedState(options);
    options.render();
  }

  window.AppController = {
    init
  };
})();
