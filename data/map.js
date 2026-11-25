/* Interactive Night City 2077 map geometry.
   Coordinates use the local base map (1103×1035). The map itself is a schematic
   overlay over the district map from the Cyberpunk 2077 Official Guide. */
window.CPR = window.CPR || {};
CPR.map = {
  width: 1103,
  height: 1035,
  image: 'assets/img/nc2077-map.jpg',
  source: 'Подложка: карта районов Cyberpunk 2077 Official Guide. Границы, метки и подписи — схема для игры.',
  districts: [
    {
      id: 'badlands', name: 'Пустоши', color: '#ff2a4d', label: [825, 205], labelWidth: 110,
      polygon: [[680,80],[900,80],[1050,180],[1080,600],[1010,810],[900,900],[780,950],[680,900],[620,820],[610,740],[640,680],[700,620],[690,560],[680,500]]
    },
    {
      id: 'watson', name: 'Уотсон', color: '#00e5ff', label: [240, 165], labelWidth: 100,
      polygon: [[110,285],[105,200],[120,160],[160,125],[220,108],[290,102],[350,112],[395,140],[425,185],[455,235],[465,290],[445,345],[410,380],[370,395],[330,410],[300,390],[260,420],[215,400],[180,365],[150,330],[110,310]]
    },
    {
      id: 'westbrook', name: 'Уэстбрук', color: '#ff2e88', label: [465, 375], labelWidth: 110,
      polygon: [[465,290],[505,285],[545,295],[590,310],[635,335],[665,380],[675,430],[680,500],[660,535],[620,555],[570,560],[530,540],[490,515],[465,485],[450,440],[440,390],[445,340]]
    },
    {
      id: 'heywood', name: 'Хейвуд', color: '#ff8a00', label: [285, 575], labelWidth: 100,
      polygon: [[170,525],[220,530],[270,520],[320,530],[370,520],[410,525],[435,550],[445,590],[430,635],[405,675],[365,695],[320,705],[280,690],[245,665],[205,690],[175,660],[160,610],[165,565]]
    },
    {
      id: 'santodomingo', name: 'Санто-Доминго', color: '#35ff8a', label: [505, 605], labelWidth: 135,
      polygon: [[435,545],[475,525],[520,520],[565,535],[610,555],[650,580],[685,615],[700,660],[690,710],[665,745],[625,760],[580,755],[535,740],[490,720],[455,690],[435,650],[430,600]]
    },
    {
      id: 'pacifica', name: 'Пасифика', color: '#b388ff', label: [175, 715], labelWidth: 100,
      polygon: [[55,680],[95,660],[145,650],[185,670],[215,690],[250,675],[285,690],[320,710],[335,745],[315,780],[275,810],[225,825],[175,830],[125,820],[85,790],[55,745]]
    },
    {
      id: 'citycenter', name: 'Сити-Центр', color: '#fcee0a', label: [270, 445], labelWidth: 115,
      polygon: [[175,440],[215,420],[270,410],[330,410],[385,420],[415,445],[420,485],[395,515],[350,525],[300,530],[255,520],[210,525],[180,505],[165,475]]
    },
  ],

  subdistricts: [
    { id: 'northside', name: 'Нортсайд', x: 420, y: 230, district: 'watson' },
    { id: 'arasaka-waterfront', name: 'Порт Arasaka', x: 210, y: 290, district: 'watson' },
    { id: 'kabuki', name: 'Кабуки', x: 410, y: 320, district: 'watson' },
    { id: 'little-china', name: 'Маленький Китай', x: 290, y: 380, district: 'watson' },
    { id: 'japantown', name: 'Джапантаун', x: 450, y: 440, district: 'westbrook' },
    { id: 'north-oak', name: 'Северный Оук', x: 560, y: 430, district: 'westbrook' },
    { id: 'charter-hill', name: 'Чартер-Хилл', x: 560, y: 560, district: 'westbrook' },
    { id: 'downtown', name: 'Даунтаун', x: 240, y: 490, district: 'citycenter' },
    { id: 'corporate-plaza', name: 'Корпоративная площадь', x: 350, y: 520, district: 'citycenter' },
    { id: 'vista-del-rey', name: 'Виста-дель-Рей', x: 390, y: 560, district: 'heywood' },
    { id: 'wellsprings', name: 'Уэллспрингс', x: 230, y: 600, district: 'heywood' },
    { id: 'the-glen', name: 'Глен', x: 310, y: 640, district: 'heywood' },
    { id: 'arroyo', name: 'Арройо', x: 480, y: 680, district: 'santodomingo' },
    { id: 'rancho-coronado', name: 'Ранчо-Коронадо', x: 600, y: 720, district: 'santodomingo' },
    { id: 'coastview', name: 'Коствью', x: 270, y: 720, district: 'pacifica' },
    { id: 'west-wind-estate', name: 'Вест-Уинд-Эстейт', x: 130, y: 770, district: 'pacifica' },
    { id: 'rocky-ridge', name: 'Рокки-Ридж', x: 800, y: 470, district: 'badlands' },
    { id: 'red-peaks', name: 'Ред-Пикс', x: 680, y: 510, district: 'badlands' },
    { id: 'sierra-sonora', name: 'Сьерра-Сонома', x: 930, y: 800, district: 'badlands' },
    { id: 'laguna-bend', name: 'Лагуна-Бенд', x: 650, y: 900, district: 'badlands' },
    { id: 'biotechnica-flats', name: 'Биотехника-Флэтс', x: 230, y: 930, district: 'badlands' },
    { id: 'north-sunrise', name: 'Северное нефтяное поле', x: 250, y: 50, district: 'badlands' },
  ],

  gangs: [
    { id: 'maelstrom', gangId: 'maelstrom', x: 390, y: 235, r: 42, label: 'Maelstrom', note: 'Нортсайд, Totentanz' },
    { id: 'tyger-claws', gangId: 'tyger-claws', x: 445, y: 430, r: 50, label: 'Tyger Claws', note: 'Джапантаун и Кабуки' },
    { id: 'valentinos', gangId: 'valentinos', x: 300, y: 610, r: 48, label: 'Valentinos', note: 'Хейвуд' },
    { id: 'sixth-street', gangId: 'sixth-street', x: 520, y: 690, r: 55, label: '6th Street', note: 'Санто-Доминго' },
    { id: 'voodoo-boys', gangId: 'voodoo-boys', x: 180, y: 760, r: 45, label: 'Voodoo Boys', note: 'Пасифика' },
    { id: 'animals', gangId: 'animals', x: 560, y: 560, r: 35, label: 'Animals', note: 'Чартер-Хилл, спортзалы' },
    { id: 'moxes', gangId: 'moxes', x: 380, y: 340, r: 26, label: 'Moxes', note: 'Лиззи’с Бар, Кабуки' },
    { id: 'scavengers', gangId: 'scavengers', x: 690, y: 820, r: 48, label: 'Скавверы', note: 'Пасифика и Пустоши' },
  ],

  corps: [
    { id: 'arasaka', corpId: 'arasaka', x: 220, y: 290, short: 'ARA', label: 'Arasaka Waterfront' },
    { id: 'militech', corpId: 'militech', x: 350, y: 510, short: 'MIL', label: 'Militech' },
    { id: 'biotechnica', corpId: 'biotechnica', x: 230, y: 930, short: 'BIO', label: 'Biotechnica Flats' },
    { id: 'petrochem', corpId: 'petrochem', x: 330, y: 540, short: 'PET', label: 'Petrochem' },
    { id: 'kang-tao', corpId: 'kang-tao', x: 420, y: 300, short: 'KAN', label: 'Kang Tao' },
    { id: 'zetatech', corpId: 'zetatech', x: 480, y: 470, short: 'ZET', label: 'Zetatech' },
    { id: 'raven', corpId: 'raven', x: 540, y: 610, short: 'RAV', label: 'Raven Microcybernetics' },
    { id: 'trauma-team', corpId: 'trauma-team', x: 365, y: 495, short: 'TRA', label: 'Trauma Team' },
    { id: 'network-54', corpId: 'network-54', x: 260, y: 480, short: 'N54', label: 'Network 54' },
    { id: 'danger-gal', corpId: 'danger-gal', x: 580, y: 550, short: 'DGR', label: 'Danger Gal' },
    { id: 'rocklin', corpId: 'rocklin', x: 610, y: 470, short: 'ROC', label: 'Rocklin Augmentics' },
    { id: 'ziggurat', corpId: 'ziggurat', x: 340, y: 450, short: 'ZIG', label: 'Ziggurat' },
    { id: 'zhigafa', corpId: 'zhigafa', x: 530, y: 700, short: 'ZHF', label: 'Zhigafa' },
    { id: 'continental', corpId: 'continental', x: 260, y: 650, short: 'CON', label: 'Continental Brands' },
    { id: 'sov-oil', corpId: 'sov-oil', x: 620, y: 360, short: 'SOV', label: 'SovOil' },
  ],

  services: [
    { id: 'ncpd', serviceId: 'ncpd', x: 310, y: 510, label: 'NCPD HQ' },
    { id: 'maxtac', serviceId: 'maxtac', x: 330, y: 525, label: 'MaxTac' },
    { id: 'fire', serviceId: 'fire', x: 280, y: 500, label: 'Пожарная' },
    { id: 'nomads', serviceId: 'nomads', x: 760, y: 700, label: 'Кочевники' },
    { id: 'transit', serviceId: 'transit', x: 450, y: 560, label: 'Транспорт' },
  ],

  places: [
    { id: 'afterlife', name: 'Afterlife', type: 'bar', x: 350, y: 390, district: 'watson', desc: 'Легендарный бар наёмников. Здесь Роуг, фиксеры и все, кто ищет работу, которую нельзя афишировать.' },
    { id: 'lizzies', name: 'Лиззи’с Бар', type: 'club', x: 380, y: 340, district: 'watson', desc: 'Клуб Moxes в Кабуки. Неон, музыка и люди, которые не любят, когда их обижают.' },
    { id: 'clouds', name: 'Clouds', type: 'club', x: 455, y: 430, district: 'westbrook', desc: 'Элитный клуб в Джапантауне, где продают не только напитки. Очень внимательная охрана.' },
    { id: 'embers', name: 'Embers', type: 'restaurant', x: 330, y: 470, district: 'citycenter', desc: 'Дорогой ресторан для корпоратов и тех, кто хочет выглядеть как корпорат.' },
    { id: 'atlantis', name: 'Atlantis', type: 'club', x: 440, y: 450, district: 'citycenter', desc: 'Клуб, где встречаются фиксеры, наёмники и корпоративные тени.' },
    { id: 'wakakos', name: 'Патинко Вакако', type: 'fixer', x: 470, y: 440, district: 'westbrook', desc: 'Патинко-зал, за которым стоит Вакако Окада — один из самых старых и опасных фиксеров города.' },
    { id: 'viktor', name: 'Клиника Виктора', type: 'clinic', x: 310, y: 405, district: 'watson', desc: 'Подвальная клиника рипердока Виктора. Дёшево, надёжно и без лишних вопросов.' },
    { id: 'misty', name: 'Мистическая лавка', type: 'shop', x: 322, y: 410, district: 'watson', desc: 'Магазин Мисти Олас — таро, свечи и странные советы, которые иногда работают.' },
    { id: 'h10', name: 'Мегабашня H10', type: 'landmark', x: 340, y: 365, district: 'watson', desc: 'Огромный жилой блок, где живут тысячи людей и легко потеряться.' },
    { id: 'totentanz', name: 'Totentanz', type: 'club', x: 390, y: 220, district: 'watson', desc: 'Клуб Maelstrom в Нортсайде. Музыка, хром и очень плохие идеи.' },
    { id: 'gim', name: 'Grand Imperial Mall', type: 'landmark', x: 250, y: 740, district: 'pacifica', desc: 'Огромный заброшенный молл в Пасифике — рынок, укрытие и ловушка одновременно.' },
    { id: 'battys', name: 'Отель «Бэтти»', type: 'hotel', x: 170, y: 720, district: 'pacifica', desc: 'Старый отель в Пасифике, где можно снять номер и не спрашивать, кто жил здесь до вас.' },
    { id: 'arasaka-tower', name: 'Башня Arasaka', type: 'landmark', x: 300, y: 480, district: 'citycenter', desc: 'Символ корпоративной власти в Сити-Центре. Охрана, камеры и очень вежливые люди.' },
    { id: 'delamain', name: 'Delamain', type: 'org', x: 380, y: 620, district: 'heywood', desc: 'Городская служба роботизированных такси. Иногда машины ведут себя странно.' },
    { id: 'no-tell', name: 'No-Tell Motel', type: 'hotel', x: 430, y: 520, district: 'heywood', desc: 'Мотель, где останавливаются те, кому нельзя светиться. Номера сдаются по часам.' },
    { id: 'sunset', name: 'Sunset Motel', type: 'hotel', x: 900, y: 650, district: 'badlands', desc: 'Мотель на трассе в Пустошах. Последняя остановка перед городом — или первая после.' },
    { id: 'biotechnica-flats', name: 'Биотехника-Флэтс', type: 'landmark', x: 230, y: 930, district: 'badlands', desc: 'Поля и лаборатории Biotechnica за городом. Красиво, если не думать о том, что здесь выращивают.' },
    { id: 'laguna-bend', name: 'Лагуна-Бенд', type: 'landmark', x: 650, y: 900, district: 'badlands', desc: 'Заброшенный курорт у воды в Пустошах. Тишина, ржавчина и иногда кочевники.' },
    { id: 'rocky-ridge', name: 'Рокки-Ридж', type: 'landmark', x: 800, y: 470, district: 'badlands', desc: 'Скалы и старая дорога в Пустошах. Хорошее место для засады.' },
  ],
};
