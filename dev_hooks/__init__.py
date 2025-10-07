def _install_hook():
    import logging
    try:
        from cryptography.hazmat.primitives.serialization import pkcs12
    except Exception as e:
        logging.getLogger(__name__).info("dev_hooks: pkcs12 non importabile (%s) — ok", e)
        return

    _orig = getattr(pkcs12, "serialize_key_and_certificates", None)
    if not callable(_orig):
        return

    def _blocked(*args, **kwargs):
        raise RuntimeError(
            "Blocked: pkcs12.serialize_key_and_certificates() è disabilitata in questo ambiente."
        )

    pkcs12.serialize_key_and_certificates = _blocked
    logging.getLogger(__name__).info("dev_hooks: pkcs12.serialize_key_and_certificates() bloccata.")

def pre_init_hook(cr): _install_hook()
def post_init_hook(cr, registry): _install_hook()

