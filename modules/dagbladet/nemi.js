var Dagbladet = require('./dagbladet');

class Nemi extends Dagbladet {
  constructor({
    name = 'nemi',
    itemDescription = 'Nemistripe',
    tegneserieSideLink = 'https://www.facebook.com/Nemino-207588812589578/',
    tegneserieLogo = 'http://vignette3.wikia.nocookie.net/cartoonfatness/images/3/3e/Blog_yk_4915575_7599245_tr_logo.png/revision/latest?cb=20140520195208',
    stripUrl = 'http://www.dagbladet.no/tegneserie/nemi/',
    hour = '10',
    minute = '00'
  }) {
    super(name, itemDescription, tegneserieSideLink, tegneserieLogo, stripUrl, hour, minute);
  }
}

module.exports = Nemi;
