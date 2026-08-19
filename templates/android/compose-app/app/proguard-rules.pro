# Add project-specific ProGuard rules here.
# The AI agent appends rules for any library it introduces that needs them
# (e.g. Retrofit/Gson model classes) rather than disabling minification.

-keepattributes Signature
-keepattributes *Annotation*
-keep class __PACKAGE_NAME__.data.model.** { *; }
