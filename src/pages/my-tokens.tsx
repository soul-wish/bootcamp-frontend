import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { TokenList } from "@/components/TokenList";

interface TokenBalance {
  mint: string;
  amount: number;
}

export default function MyTokens() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!publicKey || !connected) {
      setTokens([]);
      return;
    }
    setLoading(true);
    (async () => {
      try {
        const accounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          {
            programId: new PublicKey(
              "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
            ),
          },
        );
        const tokenAccounts = accounts.value || [];
        const userTokens: TokenBalance[] = tokenAccounts
          .filter((acc) => {
            const info = acc.account.data.parsed.info;
            return info.tokenAmount.uiAmount > 0;
          })
          .map((acc) => {
            const info = acc.account.data.parsed.info;
            return {
              mint: info.mint,
              amount: Number(info.tokenAmount.amount),
            };
          });
        setTokens(userTokens);
      } catch (err) {
        setTokens([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [publicKey, connected, connection]);

  if (!connected) {
    return <div className="p-4">Connect your wallet to view your tokens.</div>;
  }

  if (loading) {
    return <div className="p-4">Loading tokens...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">My Tokens</h2>
      <TokenList tokens={tokens} />
    </div>
  );
}
