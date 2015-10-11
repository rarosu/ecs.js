2.0.0
- Entities are now destroyed immediately instead of deferring it to after the processor has finished updating. Make sure to check for destroyed entities if you have references to other entities.
- Properties for processors and observers are now stored on these objects instead of in the entity manager.
- Added a Filter abstraction that does what processors used to do and filters entities with a minimal set of components. A single processor can now create several filters for different sets of entities it is interested in.
- Changed registerProcessor interface. A component list is no longer specified.
- Removed getEntitiesDataByComponent as it did not have much use.
- Removed getEntitiesByProcessor. Use filters instead.

1.1.1
- Updated the build system. Now using grunt for linting, testing and minification.
- Added a package.json file to turn the library into a proper package.
- Added missing semicolons and fine-tuned the library according to the jshint report.
- Added a getting started tutorial to improve the documentation and updated the README.

1.1.0
- Entities can now have tags associated with them.
- API documentation has been updated.

1.0.1
- Observers are now notified before the component data is removed.

1.0.0
- Initial release.
