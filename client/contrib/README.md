Use the `contrib/[your org name]` directory to store components etc that are useful for creating your own prototypes.

You can add stuff to your own orgs contrib directory with minimal code review, since it is assumed that these modules are not being used by prototypes created by other orgs, and thus changes to this code will not break anyone else's code.

If you want to change the functionality of one of the shared modules in the `components` or `util` directory, then it's often best to create your own version of the module in `contrib` and then ask a new public maintainer to merge the new functionality into the main version, if they think that new functionality will be useful for other prototypes.

If there isn't currently a contrib directory for your org then go ahead and create one.