<p align="center">
  <img src="docs/_static/images/ferlab_image.jpeg" alt="Kids First Portal Reports API logo">
</p>
<p align="center">
  <a href="https://github.com/kids-first/kf-portal-reports-api/blob/master/LICENSE"><img src="https://img.shields.io/github/license/kids-first/kf-portal-reports-api.svg?style=for-the-badge"></a>
  <!-- <a href="https://kids-first.github.io/kf-portal-reports-api/docs/coordinator.html"><img src="https://img.shields.io/readthedocs/pip.svg?style=for-the-badge"></a> -->
  <a href="https://circleci.com/gh/kids-first/kf-download-data"><img src="https://img.shields.io/circleci/project/github/kids-first/kf-portal-reports-api.svg?style=for-the-badge"></a>
  <!--<a href="https://app.codacy.com/app/kids-first/kf-download-data/dashboard"><img src="https://img.shields.io/codacy/grade/7500ec3e7b81489dbe0ff0cee8c3d76d.svg?style=for-the-badge"></a>-->
</p>

# Ferlab Portal Reports API

The Ferlab Portal Reports API offers an endpoint to generate reports based on queries built using a Ferlab Portal.

## Adding a report

### Preparing the report

Add a directory in `src/reports/` whose name match the path in the url, along with a `config.js` file, detailed below.

> i.e. Create `src/reports/clinical-data/config.js` contains the reports accessible at the url `/reports/clinical-data`.

### `config.js` file
