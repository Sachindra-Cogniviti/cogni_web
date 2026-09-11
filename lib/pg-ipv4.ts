import dns from "node:dns"
import net from "node:net"

/**
 * Make Postgres connections prefer IPv4.
 *
 * Neon publishes both A and AAAA records. On a network without working IPv6
 * routing - which includes plenty of office and home connections - connecting
 * by hostname hangs until the socket times out rather than failing fast, and
 * the error that surfaces is a bare ETIMEDOUT that looks like the database is
 * down or the credentials are wrong. It is neither.
 *
 * Two settings are needed, which is why the obvious one alone looks broken:
 *
 *   - `ipv4first` orders resolved addresses so A records come first.
 *   - `autoSelectFamily` (on by default since Node 20) otherwise races the
 *     families anyway and can still sit on the unroutable AAAA.
 *
 * Harmless where IPv6 does work - Neon answers on IPv4 everywhere - so this is
 * applied unconditionally rather than guessing at the environment. Set
 * PG_ALLOW_IPV6=1 to opt out.
 *
 * Imported for its side effect at the top of payload.config.ts, which is
 * loaded before the database adapter opens a connection.
 */
if (process.env.PG_ALLOW_IPV6 !== "1") {
  dns.setDefaultResultOrder("ipv4first")
  net.setDefaultAutoSelectFamily(false)
}
