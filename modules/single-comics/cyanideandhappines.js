var Feed = require('../feed');
const defaultName = 'cyanideandhappiness';

class CyanideAndHappiness extends Feed {
  constructor({
    name = defaultName,
    itemDescription = 'CyanideAndHappinessstripe',
    tegneserieSideLink = 'http://explosm.net/',
    tegneserieLogo = 'http://explosm.net/img/logo.png',
    stripUrl = 'http://explosm.net/comics/latest/',
    hour = '10',
    minute = '00'
  }) {
    super(name, itemDescription, tegneserieSideLink, tegneserieLogo, stripUrl, hour, minute);
  }

  extractImageSrc($) {
    return 'http:'+$("#comic-container img").attr("src")
  }
}

module.exports = CyanideAndHappiness;
